# Navigation App - Backend Server

Backend API for the navigation application built with Node.js, Express, and SQLite.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and set your JWT secret:
```
JWT_SECRET=your_super_secret_key_here
PORT=3001
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Routes (Protected)
- `GET /api/routes/history` - Get user's route history
- `POST /api/routes/save` - Save a new route
- `DELETE /api/routes/:id` - Delete a route

### Health Check
- `GET /api/health` - Server health status

## Database

SQLite database (`database.db`) is created automatically on first run with the following tables:
- `users` - User accounts
- `route_history` - Saved routes per user

