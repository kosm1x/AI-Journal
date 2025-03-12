# AI Journal Server

Backend server for the AI Journal application based on the COMMIT 2.0 method.

## Features

- User authentication with JWT
- Journal entry management with CRUD operations
- Support for the COMMIT 2.0 journaling method:
  - Context with emotion detection
  - Objectives & Tasks tracking
  - MindMapping
  - Ideation
  - Tracking and reflection
- AI insights and analysis

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.ts        # Entry point
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-journal
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

### Development

Run the server in development mode:

```
npm run dev
```

### Production

Build the project:

```
npm run build
```

Start the production server:

```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Journal Entries

- `GET /api/journal` - Get all journal entries for current user (protected)
- `POST /api/journal` - Create a new journal entry (protected)
- `GET /api/journal/:id` - Get a single journal entry (protected)
- `PUT /api/journal/:id` - Update a journal entry (protected)
- `DELETE /api/journal/:id` - Delete a journal entry (protected)

## License

MIT 