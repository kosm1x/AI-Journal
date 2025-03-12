# AI Journal - Personal Journaling Application

## Project Overview
AI Journal is a personal journaling application that helps users track their thoughts, goals, tasks, and personal growth. The application uses MongoDB for data storage and provides a modern web interface for users to interact with their journal entries.

## Current Status
We are currently in the development phase, focusing on building the backend server with MongoDB integration. The database connection has been successfully established, and we're working on implementing the core data models and API endpoints.

## Features Being Developed
- **Journal Entries**: Record daily thoughts, experiences, and reflections
- **Goals Tracking**: Set and monitor personal and professional goals
- **Task Management**: Create and manage tasks related to goals
- **Weekly Reviews**: Reflect on progress and plan for the upcoming week
- **Themes**: Organize journal entries and goals by themes or categories
- **User Authentication**: Secure login and user-specific data storage

## Tech Stack
- **Backend**: Node.js with Express and TypeScript
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: (To be implemented - likely React or Next.js)

## Project Structure
```
server/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # MongoDB schema models
│   ├── routes/         # API route definitions
│   ├── utils/          # Utility functions
│   ├── middleware/     # Express middleware
│   └── server.ts       # Main server file
├── .env                # Environment variables (not tracked in git)
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## MongoDB Schema Models
We have implemented the following data models:
- **User**: User authentication and profile information
- **JournalEntry**: Daily journal entries with content and metadata
- **Goal**: Long-term objectives with progress tracking
- **Task**: Actionable items related to goals
- **Theme**: Categories for organizing entries and goals
- **WeeklyReview**: Weekly reflection and planning entries

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/ai-journal.git
   cd ai-journal
   ```

2. Install dependencies
   ```
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Next Steps
- Complete API endpoint implementation
- Add comprehensive error handling
- Implement frontend interface
- Add data visualization for goals and progress
- Implement AI-assisted journaling features

## Contributing
This project is currently in early development. If you're interested in contributing, please do.
## License
[MIT License](LICENSE)
