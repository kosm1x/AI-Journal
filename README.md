# COMMIT Journal - AI-Enhanced Personal Journaling

## Project Overview
COMMIT Journal is a personal journaling application that helps users track their thoughts, goals, tasks, and personal growth using the COMMIT methodology. The application uses MongoDB for data storage and provides a modern web interface for users to interact with their journal entries.

## Current Status
The backend API and database integration are now complete and functional. The Intelligence Layer has been implemented with OpenAI integration for natural language processing capabilities. The server successfully connects to MongoDB Atlas and all API endpoints for user authentication, journal entries, and AI analysis are working.

## Features Implemented
- **User Authentication**: Register and login with JWT token-based authentication
- **Journal Entries**: Create, read, update, and delete journal entries
- **Entry Types**: Organize entries by type (Context, Objectives, Mindmap, Ideate, Track)
- **Tags**: Add custom tags to entries for better organization
- **AI Analysis**: Automatic analysis of journal entries for emotions, goals, tasks, and themes
- **Smart Classification**: AI-powered classification of entry types based on content
- **Semantic Search**: Search journal entries using natural language queries
- **Weekly Summaries**: Generate AI-enhanced weekly summaries of journal entries

## Tech Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs for password hashing
- **AI Integration**: OpenAI API for natural language processing
- **Development**: Nodemon for auto-restarting during development
- **Testing**: Simple HTML/JS test client for API verification

## Project Structure
```
/
├── src/
│   ├── controllers/    # Request handlers for users and journal entries
│   ├── models/         # MongoDB schema models
│   ├── routes/         # API route definitions
│   ├── utils/          # Utility functions including database connection and OpenAI integration
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
- `GET /api/journal/search` - Search entries using natural language queries
- `GET /api/journal/tag/:tag` - Get entries by tag
- `GET /api/journal/type/:type` - Get entries by type

## Intelligence Layer
The application now features an AI-powered Intelligence Layer that provides the following capabilities:

### Content Analysis
- **Emotion Detection**: Identifies emotions expressed in journal entries
- **Goal Extraction**: Extracts goals mentioned in the content
- **Task Identification**: Identifies tasks and to-dos from entries
- **Theme Recognition**: Recognizes key themes and concepts

### Smart Classification
- Automatically classifies entries into the COMMIT framework categories:
  - **C**ontext: Background information and circumstances
  - **O**bjectives: Goals and desired outcomes
  - **M**indmap: Brainstorming and idea connections
  - **I**deate: Creative solutions and possibilities
  - **T**rack: Progress monitoring and reflection

### Knowledge Graph
- Creates connections between related entries
- Builds a semantic network of journal content
- Enables discovery of patterns and insights

## Configuration
The application uses a configuration file approach:

```javascript
// src/config/config.js
module.exports = {
  PORT: 5004,
  MONGODB_URI: 'your_mongodb_connection_string',
  JWT_SECRET: 'your_jwt_secret',
  OPENAI_API_KEY: 'your_openai_api_key'
};
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- OpenAI API key

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

3. Configure the application by updating the `src/config/config.js` file with your MongoDB connection string, JWT secret, and OpenAI API key

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
4. View all journal entries with AI analysis results
5. Search entries using natural language queries
6. Filter entries by tags and entry types
7. Get weekly AI-generated summaries

## Next Steps
- Develop a full-featured frontend interface
- Add data visualization for journal insights
- Implement adaptive learning to improve AI analysis over time
- Add support for image and file attachments
- Create mobile application for on-the-go journaling

## Contributing
This project is currently in active development. If you're interested in contributing, please reach out to the project maintainers.

## License
[MIT License](LICENSE)
