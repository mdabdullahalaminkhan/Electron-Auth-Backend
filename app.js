const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3010', 'https://electron-auth-backend.vercel.app', 'app://.*'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - Move this before other routes
app.get('/', (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Electron Authentication Backend server is working fine.",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message
    });
  }
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Connect to MongoDB with more detailed error logging
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('MongoDB connection error:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack,
    uri: process.env.MONGODB_URI ? 'URI exists' : 'URI missing'
  });
  // Don't exit in production
  if (process.env.NODE_ENV === 'production') {
    console.error('MongoDB connection failed but server will continue running');
  } else {
    process.exit(1);
  }
});

// Basic error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

module.exports = app; 