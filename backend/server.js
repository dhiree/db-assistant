// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const mongoRoutes = require('./routes/mongoRoute'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.get("/", (req, res) => {
    res.send("Apis Is working");
});

// Use mongo routes
app.use('/api', mongoRoutes);

const PORT = process.env.PORT || 5000;
console.log("🚀 ~ PORT:", PORT)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
