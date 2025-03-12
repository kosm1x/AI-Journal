// Configuration settings for the application
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5004,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4-turbo'
};
