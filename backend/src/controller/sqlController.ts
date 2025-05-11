// callBase/SQLController.ts

import { Request, Response } from 'express';
import mysql, { Connection } from 'mysql2/promise';
import axios from 'axios';

 class SQLController {
  private dbClient: Connection | null = null;

  public connectDB = async (req: Request, res: Response): Promise<void> => {
    const { dbName, dbHostName, port, userName, password } = req.body;

    try {
      this.dbClient = await mysql.createConnection({
        host: dbHostName,
        user: userName,
        password: password,
        database: dbName,
        port: port || 3306,
      });

      res.json({ success: true, message: 'SQL Database connected successfully' });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'SQL connection failed',
        error: err.message,
      });
    }
  };

  
  public handleQuery = async (req: Request, res: Response): Promise<void> => {
    const { prompt, tableName } = req.body;

    if (!this.dbClient) {
      res.status(400).json({ success: false, message: 'No DB connection' });
      return;
    }

    try {
      const [columns] = await this.dbClient.execute(`DESCRIBE ${tableName}`);
      const schemaArray = (columns as any[]).map(col => `${col.Field} (${col.Type})`);
      const schemaInfo = schemaArray.join(', ');

      // Prompt Gemini with schema-aware instruction
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Convert this natural language prompt into a valid SQL query.  
Use the following table structure: ${tableName} - ${schemaInfo}.
Ensure correct column usage. Do NOT include markdown, explanations, or code blocks.`,
                },
                { text: prompt },
              ],
            },
          ],
        }
      );

      let generatedQueryText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      generatedQueryText = generatedQueryText.replace(/```(?:sql)?\n?/, '').replace(/```$/, '').trim();
      // Execute the generated SQL
      const [result] = await this.dbClient.execute(generatedQueryText);
      console.log("result-------------->>>>>>>",result)


      res.json({ success: true, sqlQuery: generatedQueryText, result });

    } catch (err: any) {
      console.error('Error in /query:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
}

export default SQLController;