import mongoose from 'mongoose';
import axios from 'axios';
import { Request, Response } from 'express';

 class MongoController {

  public connectDB = async (req: Request, res: Response): Promise<void> => {
    const { mongoUri } = req.body;
     let  dbConnection:any

    try {
      dbConnection = await mongoose.connect(mongoUri, {});
      res.json({ success: true, message: 'MongoDB connected successfully' });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'MongoDB connection failed',
        error: err.message,
      });
    }
  };

  public handleQuery = async (req: Request, res: Response): Promise<void> => {
  const { prompt, collectionName } = req.body;

  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    res.status(400).json({ success: false, message: 'No DB connection' });
    return;
  }

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Convert this natural language prompt into a valid MongoDB query. 
If the prompt requires simple filtering, return a JSON object that can be used inside find().
If the prompt needs more advanced logic (like random sampling, grouping, etc.), return a valid aggregation pipeline as an array.
Do NOT include code blocks, markdown, or any explanation — only return valid JSON.`,
              },
              { text: prompt },
            ],
          },
        ],
      }
    );

    let generatedQueryText = geminiRes.data.candidates[0].content.parts[0].text.trim();

    if (generatedQueryText.startsWith('```')) {
      generatedQueryText = generatedQueryText.replace(/```(?:json)?\n?/, '').replace(/```$/, '').trim();
    }

    let mongoQuery;
    try {
      mongoQuery = JSON.parse(generatedQueryText);
    } catch (parseErr: any) {
      res.status(400).json({
        success: false,
        message: 'Failed to parse generated query as JSON',
        error: parseErr.message,
        rawQuery: generatedQueryText,
      });
      return;
    }

    const collection = mongoose.connection.db.collection(collectionName);

    // Check if it's an aggregation pipeline (array) or a simple find query (object)
    const result = Array.isArray(mongoQuery)
      ? await collection.aggregate(mongoQuery).toArray()
      : await collection.find(mongoQuery).toArray();

    res.json({ success: true, mongoQuery, result });

  } catch (err: any) {
    console.error('Error in /query:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
}

export default MongoController