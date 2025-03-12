// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const config = require('./src/config/config');
const connectDB = require('./src/utils/db');

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const journalRoutes = require('./src/routes/journalRoutes');

// Initialize Express app
const app = express();
const PORT = config.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/journal', journalRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to COMMIT Journal API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
