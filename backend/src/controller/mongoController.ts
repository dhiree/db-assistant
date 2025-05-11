import mongoose from 'mongoose';
import axios from 'axios';
import { Request, Response } from 'express';

 class MongoController {

  public connectDB = async (req: Request, res: Response): Promise<void> => {
    const { mongoUri } = req.body;
     let  dbConnection:any

    try {
      dbConnection = await mongoose.connect(mongoUri, {});
      //console.log("dbConnection------>>>>",dbConnection)
      res.json({ 
        success: true, message: 'MongoDB connected successfully',
        host: dbConnection.connection.host,
        db: dbConnection.connection.name,
       // DB: mongoose.connection.db?.aggregate,

       });
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

  const url = 'https://api.openai.com/v1/chat/completions';
  try {
    const openaiRes = await axios.post(
      url,
      {
        model: 'gpt-3.5-turbo', 
        messages: [
          // {
          //   role: 'system',
          //   content: 'You are an assistant that converts natural language into MongoDB queries.',
          // },
          {
     role: 'system',
      content: 'You are an expert MongoDB assistant. Convert user prompts into valid MongoDB queries. Return only the raw JSON query.'
},
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );


    console.log("openaiRes------------>>>>",openaiRes)

    let generatedQueryText = openaiRes.data.choices[0].message.content.trim();

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
    const result = Array.isArray(mongoQuery)
      ? await collection.aggregate(mongoQuery).toArray()
      : await collection.find(mongoQuery).toArray();

    res.json({ success: true, mongoQuery, result });

  } catch (err: any) {
    console.error('Error in /query:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
 }
export default MongoController

