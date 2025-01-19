# Notes API

A secure and scalable RESTful API for creating, sharing, and searching notes.

## Tech Stack

**Framework** 
Express.js
Chosen for its simplicity when building RESTful APIs with minimal setup. It has extensive middleware with a very active community..

**Database** 
PostgreSQL
Used for its powerful and reliable relational database with excellent scalability and performance. Its built in text search capabilities are very useful for this project.

**Authentication** 
JSON Web Tokens (JWT)
Chosen for its easy to use and secure authentication methods. Self contained and stateless its great for scalable API's and has no need for server side storage.

**Additional Tools**
  - `express-rate-limit`: For API rate limiting
  - `pg`: PostgreSQL client for Node.js
  - `jest` & `supertest`: For testing
  - `dotenv`: Environment variable management

## Setup Instructions

**Prerequisites**
   - Node.js (v14 or higher)
   - PostgreSQL (v12 or higher)
   - npm or yarn

**Database Setup**
   ```bash
    # Create database and user with password
   psql postgres
   CREATE USER notesdev WITH PASSWORD 'speer';
   CREATE DATABASE notes_db OWNER notesdev;
   ```

**Environment Setup**
   ```bash
   # Clone the repository
   git clone git@github.com:Carmichaeldb/notes-backend.git
   cd notes-backend

   # Install dependencies
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials as needed
   ```

**Initialize Database**
   ```bash
   # Run schema and seed files
   npm run dbreset
   ```

**Start the Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Testing
The project uses Jest and Supertest for testing. Tests cover:
- Unit tests for models
- Integration tests for API endpoints
- Authentication flows
- Rate limiting
- Search functionality

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# View test coverage
npm test -- --coverage
```

Test files are organized as:
- `tests/noteModel.test.js`: Unit tests for note operations
- `tests/noteRoutes.test.js`: Integration tests for note endpoints
- `tests/userRoutes.test.js`: Tests for authentication endpoints
- `tests/userModel.test.js`: Tests for user operations
- `tests/rateLimiter.test.js`: Tests for rate limiting functionality

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup`: Create a new user account
- `POST /api/auth/login`: Log in and receive access token

### Note Endpoints
All note endpoints require Authentication header: `Bearer <token>`

- `GET /api/notes`: Get all notes for authenticated user
- `GET /api/notes/:id`: Get specific note by ID
- `POST /api/notes`: Create a new note
- `PUT /api/notes/:id`: Update existing note
- `DELETE /api/notes/:id`: Delete note by ID
- `POST /api/notes/:id/share`: Share note with another user
- `GET /api/search?query=:query`: Search notes by keyword

Enjoy!

