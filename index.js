const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
const mainRouter = require('./src/routes');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'], // specify the allowed origin(s)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };  
app.use(cors(corsOptions));
app.use(express.json({ extended: false }));

// Routes
app.use('/api/v1', mainRouter);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
