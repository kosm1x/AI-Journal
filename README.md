# COMMIT Journal - AI-Enhanced Personal Journaling

## Project Overview
COMMIT Journal is a personal journaling application that helps users track their thoughts, goals, tasks, and personal growth using the COMMIT methodology. The application uses MongoDB for data storage and provides a modern web interface for users to interact with their journal entries.

## Current Status
The backend API and database integration are now complete and functional. The server successfully connects to MongoDB Atlas and all API endpoints for user authentication and journal entries are working.

## Features Implemented
- **User Authentication**: Register and login with JWT token-based authentication
- **Journal Entries**: Create, read, update, and delete journal entries
- **Entry Types**: Organize entries by type (Context, Objectives, Mindmap, Ideate, Track)
- **Tags**: Add custom tags to entries for better organization
- **Weekly Summaries**: Generate weekly summaries of journal entries

## Tech Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs for password hashing
- **Development**: Nodemon for auto-restarting during development
- **Testing**: Simple HTML/JS test client for API verification

## Project Structure
```
/
├── src/
│   ├── controllers/    # Request handlers for users and journal entries
│   ├── models/         # MongoDB schema models
│   ├── routes/         # API route definitions
│   ├── utils/          # Utility functions including database connection
│   ├── middleware/     # Express middleware including auth protection
│   └── config/         # Configuration settings
├── .env                # Environment variables (not tracked in git)
├── server.js           # Main server file
├── test-client.html    # Simple HTML client for testing API endpoints
└── package.json        # Project dependencies
```

## API Endpoints
The following API endpoints have been implemented:

### User Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and receive JWT token
- `GET /api/users/profile` - Get user profile (protected route)

### Journal Entries
- `POST /api/journal` - Create a new journal entry
- `GET /api/journal` - Get all journal entries for the logged-in user
- `GET /api/journal/:id` - Get a specific journal entry
- `PUT /api/journal/:id` - Update a journal entry
- `DELETE /api/journal/:id` - Delete a journal entry
- `GET /api/journal/summary/weekly` - Get weekly summary of journal entries

## Configuration
The application now uses a configuration file approach instead of relying solely on environment variables:

```javascript
// src/config/config.js
module.exports = {
  PORT: 5002,
  MONGODB_URI: 'your_mongodb_connection_string',
  JWT_SECRET: 'your_jwt_secret'
};
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/AI-Journal.git
   cd AI-Journal
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure the application by updating the `src/config/config.js` file with your MongoDB connection string and JWT secret

4. Start the development server
   ```
   npm run dev
   ```

5. Open the test client in your browser
   ```
   start test-client.html
   ```

## Testing the API
A simple HTML/JavaScript test client (`test-client.html`) has been created to test all API endpoints. This client provides a user-friendly interface to:

1. Register a new user
2. Login with existing credentials
3. Create journal entries with content, type, and tags
4. View all journal entries
5. Get weekly summaries

## Next Steps
- Implement the NLP features for emotion detection and entry classification
- Develop a full-featured frontend interface
- Add data visualization for journal insights
- Implement AI-assisted journaling features
- Add support for image and file attachments

## Contributing
This project is currently in active development. If you're interested in contributing, please reach out to the project maintainers.

## License
[MIT License](LICENSE)
