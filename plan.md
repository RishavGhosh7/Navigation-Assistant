# Navigation App Implementation Plan

## Tech Stack

- **Frontend**: React with JavaScript, Leaflet, React Router (No TypeScript)
- **Backend**: Node.js + Express, SQLite3
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS for responsive design
- **APIs**: OpenStreetMap, OSRM (Open Source Routing Machine), Nominatim

## Project Structure

```
/client                 # React frontend
  /src
    /components        # Reusable UI components
    /pages            # Main pages (Map, Login, History)
    /services         # API calls to backend
    /hooks            # Custom React hooks
    /utils            # Helper functions
/server                # Node.js backend
  /routes             # API endpoints
  /controllers        # Business logic
  /models             # Database models
  /middleware         # Auth middleware
  database.db         # SQLite database
```

## Implementation Steps

### 1. Backend Setup

- Initialize Node.js project with Express
- Set up SQLite database with tables:
  - `users` (id, email, password_hash, created_at)
  - `route_history` (id, user_id, origin, destination, route_data, timestamp)
- Implement JWT-based authentication endpoints (signup, login, logout)
- Create API endpoints:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/routes/history` - Get user's route history
  - `POST /api/routes/save` - Save a route
  - `DELETE /api/routes/:id` - Delete a route
- Add authentication middleware for protected routes

### 2. Frontend Setup

- Initialize React app with Vite + JavaScript
- Install dependencies: leaflet, react-router-dom, axios, tailwind
- Set up routing (/, /login, /register, /history)
- Create authentication context for managing user state
- Implement protected routes that require login

### 3. Map Integration

- Integrate Leaflet for map display
- Implement map controls (zoom, rotate, geolocate)
- Add OpenStreetMap tiles for map display
- Style map for optimal visibility (light/dark mode support)
- Make map responsive for mobile, tablet, and desktop

### 4. Search Functionality

- Implement search bar with Nominatim Geocoding API
- Add autocomplete suggestions as user types
- Display search results as markers on map
- Handle location selection and map centering

### 5. Routing Features

- Implement origin and destination selection
- Use OSRM (Open Source Routing Machine) for turn-by-turn routing
- Display route polyline on map
- Show route details (distance, duration)
- Add alternative route options
- Implement "Start Navigation" button

### 6. Route History

- Create history page showing saved routes
- Display route cards with origin, destination, date
- Add ability to view route details
- Implement delete functionality
- Add "Navigate Again" button to reload saved routes
- Paginate history for better performance

### 7. User Interface

- Build responsive navigation header with auth status
- Create login/register forms with validation
- Design modern map interface with search overlay
- Add loading states and error handling
- Implement toast notifications for user feedback
- Ensure mobile-first responsive design

### 8. Integration & Polish

- Connect frontend to backend API
- Implement proper error handling throughout
- Add loading spinners for async operations
- Test authentication flow end-to-end
- Test on multiple screen sizes and devices
- Add environment variables for configuration

## Key Files Created

**Backend:**

- `server/index.js` - Express server setup
- `server/database.js` - SQLite connection and schema
- `server/routes/auth.js` - Authentication routes
- `server/routes/routes.js` - Route history endpoints
- `server/middleware/auth.js` - JWT verification

**Frontend:**

- `client/src/App.jsx` - Main app component with routing
- `client/src/pages/MapPage.jsx` - Main map interface
- `client/src/pages/LoginPage.jsx` - Login/register page
- `client/src/pages/HistoryPage.jsx` - Route history page
- `client/src/components/Map.jsx` - Leaflet map component
- `client/src/components/SearchBar.jsx` - Location search
- `client/src/components/RoutePanel.jsx` - Route details display
- `client/src/services/api.js` - API client functions
- `client/src/context/AuthContext.jsx` - Auth state management

## Environment Variables Needed

- `JWT_SECRET` - Random secret for token signing
- `PORT` - Server port (default 3001)

## Free Services Used

- **OpenStreetMap** - Free map tiles
- **OSRM** - Free routing service
- **Nominatim** - Free geocoding service

## Notes

- SQLite database file will be created automatically
- JWT tokens stored in localStorage on client
- Route data stored as JSON in database
- No API keys or registration required
- Completely free and open-source solution
