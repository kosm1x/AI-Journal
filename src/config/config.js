// Configuration settings for the application
// No need to require dotenv here since it's loaded in server.js
module.exports = {
  PORT: process.env.PORT || 5004,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/journal',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_replace_in_production',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4-turbo'
};
