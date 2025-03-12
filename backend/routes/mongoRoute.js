// mongoRoutes.js

const express = require('express');
const { connectDB, handleQuery } = require('../controller/mongoController'); 

const router = express.Router();

// MongoDB connection route
router.post('/connect-db', connectDB);

// Query execution route
router.post('/query', handleQuery);

module.exports = router;
