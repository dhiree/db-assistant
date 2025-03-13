// mongoRoutes.js

const express = require('express');
const { connectDB, handleQuery } = require('../controller/sqlController'); 

const router = express.Router();

// MongoDB connection route
router.post('/connect-sql', connectDB);

// Query execution route
router.post('/query-sql', handleQuery);

module.exports = router;
