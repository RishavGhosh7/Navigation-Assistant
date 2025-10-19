# Navigation App

A responsive web-based navigation application similar to Google Maps, built with React, Node.js, and Mapbox.

## Features

- 🗺️ Interactive map with OpenStreetMap + Leaflet
- 🔍 Location search with autocomplete
- 🛣️ Turn-by-turn routing with traffic data
- 🚀 Simple and lightweight - no authentication required
- 📱 Responsive design for all devices
- 🚦 Free and open-source mapping

## Tech Stack

- **Frontend**: React + JavaScript + Vite (No TypeScript)
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Maps**: OpenStreetMap + Leaflet (Free!)
- **Routing**: OSRM (Open Source Routing Machine)
- **Geocoding**: Nominatim (OpenStreetMap)
- **Styling**: Tailwind CSS
- **Authentication**: None (simplified)

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Mapbox account and access token

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd navigation-app
```

### 2. Backend Setup (Optional - not needed for basic functionality)

```bash
cd server
npm install
# No environment variables needed
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install --legacy-peer-deps
# No API keys needed - completely free!
npm run dev
```

### 4. No API Keys Required! 🎉

This app uses **completely free** services:

- **OpenStreetMap** for map tiles
- **OSRM** for routing
- **Nominatim** for geocoding

No registration or API keys needed!

## Environment Variables

### Backend (.env)

```
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

### Frontend (.env)

```
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
VITE_API_BASE_URL=http://localhost:3001/api
```

## Project Structure

```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Main pages
│   │   ├── services/     # API calls
│   │   └── context/      # React context
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth middleware
│   └── database.js       # SQLite setup
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Routes (Protected)

- `GET /api/routes/history` - Get user's route history
- `POST /api/routes/save` - Save a new route
- `DELETE /api/routes/:id` - Delete a route

## Usage

1. **Register/Login**: Create an account or sign in
2. **Search Locations**: Use the search bars to find start and end points
3. **View Routes**: See calculated routes with distance, duration, and traffic
4. **Save Routes**: Save frequently used routes to your history
5. **View History**: Access all your saved routes on the history page

## Development

### Backend

```bash
cd server
npm run dev  # Development with auto-reload
npm start    # Production
```

### Frontend

```bash
cd client
npm run dev  # Development server
npm run build # Production build
```

## Deployment

The app can be deployed to any platform that supports Node.js and static hosting:

- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, GitHub Pages

## License

MIT License
