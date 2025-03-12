// mongoController.js

const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB connection handler
let dbConnection = null;

// Connect to MongoDB dynamically
const connectDB = async (req, res) => {
    const { mongoUri } = req.body;
    try {
        dbConnection = await mongoose.connect(mongoUri, {});
        res.json({ success: true, message: 'MongoDB connected successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'MongoDB connection failed', error: err.message });
    }
};

// Handle query generation from prompt and execute it
const handleQuery = async (req, res) => {
    const { prompt, collectionName } = req.body;

    if (!dbConnection) {
        return res.status(400).json({ success: false, message: 'No DB connection' });
    }

    try {
        // Prompt Gemini with strict instructions
        const geminiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `Convert this natural language prompt into a valid MongoDB query. 
                        If the prompt requires simple filtering, return a JSON object that can be used inside find().
                        If the prompt needs more advanced logic (like random sampling, grouping, etc.), return a valid aggregation pipeline as an array.
                        Do NOT include code blocks, markdown, or any explanation — only return valid JSON.`
                    }, {
                        text: prompt
                    }]
                }]
            }
        );

        let generatedQueryText = geminiRes.data.candidates[0].content.parts[0].text.trim();
        console.log('Raw Gemini Response:', generatedQueryText);

        // Clean up in case Gemini still sends code blocks
        if (generatedQueryText.startsWith("```")) {
            generatedQueryText = generatedQueryText.replace(/```(?:json)?\n?/, '').replace(/```$/, '').trim();
        }

        let mongoQuery;
        try {
            mongoQuery = JSON.parse(generatedQueryText);
        } catch (parseErr) {
            return res.status(400).json({
                success: false,
                message: 'Failed to parse generated query as JSON',
                error: parseErr.message,
                rawQuery: generatedQueryText
            });
        }

        const result = await mongoose.connection.db
            .collection(collectionName)
            .find(mongoQuery)
            .toArray();

        res.json({ success: true, mongoQuery, result });

    } catch (err) {
        console.error('Error in /query:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { connectDB, handleQuery };
