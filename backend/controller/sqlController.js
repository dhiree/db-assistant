// sqlController.js

const { Client } = require('mysql2'); 
const axios = require('axios');

// SQL connection handler
let dbClient = null;

// Connect to SQL database dynamically
const connectDB = async (req, res) => {
    const { dbUri } = req.body; 
    try {
        dbClient = new Client({
            connectionString: dbUri,
        });
        await dbClient.connect();
        res.json({ success: true, message: 'SQL Database connected successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'SQL connection failed', error: err.message });
    }
};

// Handle query generation from prompt and execute it
const handleQuery = async (req, res) => {
    const { prompt, tableName } = req.body;

    if (!dbClient) {
        return res.status(400).json({ success: false, message: 'No DB connection' });
    }

    try {
        // Prompt Gemini with strict instructions for SQL query generation
        const geminiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `Convert this natural language prompt into a valid SQL query. 
                        If the prompt requires a simple SELECT query, return the appropriate SQL query.
                        If the prompt needs more advanced logic (like JOINs, GROUP BY, etc.), return a valid SQL query.
                        Do NOT include code blocks, markdown, or any explanation — only return the SQL query.`
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
            generatedQueryText = generatedQueryText.replace(/```(?:sql)?\n?/, '').replace(/```$/, '').trim();
        }

        // Execute the generated SQL query
        const result = await dbClient.query(generatedQueryText);

        res.json({ success: true, sqlQuery: generatedQueryText, result: result.rows });

    } catch (err) {
        console.error('Error in /query:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { connectDB, handleQuery };
