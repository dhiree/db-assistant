const mysql = require('mysql2/promise');
const axios = require('axios');

let dbClient = null;

// Connect to SQL database dynamically
const connectDB = async (req, res) => {
    const { dbName, dbHostName, port, userName, password } = req.body; 

    try {
        dbClient = await mysql.createConnection({
            host: dbHostName,
            user: userName,
            password: password,
            database: dbName,
            port: port || 3306
        });

        res.json({ success: true, message: 'SQL Database connected successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'SQL connection failed', error: err.message });
    }
};

// Handle query generation and execution
const handleQuery = async (req, res) => {
    const { prompt, tableName } = req.body;

    if (!dbClient) {
        return res.status(400).json({ success: false, message: 'No DB connection' });
    }

    try {
        // Fetch the table schema
        const [columns] = await dbClient.execute(`DESCRIBE ${tableName}`);
        const schemaInfo = columns.map(col => `${col.Field} (${col.Type})`).join(", ");

        // Call Gemini API with enhanced context
        const geminiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `Convert this natural language prompt into a valid SQL query.  
                        Use the following table structure: ${tableName} - ${schemaInfo}.
                        Ensure correct column usage. Do NOT include markdown, explanations, or code blocks.`
                    }, {
                        text: prompt
                    }]
                }]
            }
        );

        let generatedQueryText = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "";

        // Sanitize the query (removes unwanted characters)
        generatedQueryText = generatedQueryText.replace(/```(?:sql)?\n?/, '').replace(/```$/, '').trim();

        // Execute SQL
        const [result] = await dbClient.execute(generatedQueryText);

        res.json({ success: true, sqlQuery: generatedQueryText, result });

    } catch (err) {
        console.error('Error in /query:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { connectDB, handleQuery };
