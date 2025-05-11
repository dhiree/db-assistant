import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import MongoRoutes from './src/routes/mongoRoute';
import SqlRoutes from './src/routes/sqlRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/mongo', MongoRoutes.router);  
app.use('/api/sql', SqlRoutes.router);      // Use .router to get the Router instance

// Root route
app.get('/', (_req, res) => {
  res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
