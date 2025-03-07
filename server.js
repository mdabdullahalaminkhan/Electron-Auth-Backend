const app = require('./app');

const PORT = process.env.PORT || 3010;

// Add environment check
console.log('Environment check:', {
  mongoUri: process.env.MONGODB_URI ? 'exists' : 'missing',
  jwtSecret: process.env.JWT_SECRET ? 'exists' : 'missing',
  nodeEnv: process.env.NODE_ENV,
  port: PORT
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Add global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 