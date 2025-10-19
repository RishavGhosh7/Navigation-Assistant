# Navigation Assistant

A simple, responsive web-based navigation application built with React and Leaflet. No authentication required - just pure maps functionality!

## Features

- 🗺️ Interactive map with OpenStreetMap + Leaflet
- 🔍 Location search with autocomplete
- 🛣️ Turn-by-turn routing with real-time data
- 🚀 Simple and lightweight - no authentication required
- 📱 Responsive design for all devices
- 🚦 Completely free and open-source mapping
- 🎯 Voice-guided navigation interface

## Tech Stack

- **Frontend**: React + JavaScript + Vite
- **Backend**: Node.js + Express (minimal API)
- **Maps**: OpenStreetMap + Leaflet (Free!)
- **Routing**: OSRM (Open Source Routing Machine)
- **Geocoding**: Nominatim (OpenStreetMap)
- **Styling**: Tailwind CSS
- **Authentication**: None - completely open!

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### 1. Clone and Setup

```bash
git clone https://github.com/RishavGhosh7/Navigation-Assistant.git
cd Navigation-Assistant
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
```

### 3. Start Development

```bash
# Start the client (main app)
cd client
npm run dev
```

### 4. No API Keys Required! 🎉

This app uses **completely free** services:

- **OpenStreetMap** for map tiles
- **OSRM** for routing
- **Nominatim** for geocoding

No registration or API keys needed!

## Environment Variables

**None required!** This app works out of the box with no configuration needed.

## Project Structure

```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Main pages (HomePage, NavigationPage)
│   │   └── services/     # External API calls (OSRM, Nominatim)
│   └── package.json
├── api/                   # Minimal Express API
│   └── index.js          # Basic health check endpoint
├── vercel.json           # Vercel deployment config
└── README.md
```

## API Endpoints

### Basic API

- `GET /api/status` - Health check
- `GET /api` - API info

### External APIs Used

- **OSRM** - Route calculation
- **Nominatim** - Location search and geocoding
- **OpenStreetMap** - Map tiles

## Usage

1. **Open the App**: Visit the homepage to get started
2. **Search Locations**: Use the search bars to find start and end points
3. **View Routes**: See calculated routes with distance, duration, and turn-by-turn directions
4. **Navigate**: Follow the voice-guided directions
5. **Explore**: Use the interactive map to discover new places

## Development

### Frontend Only

```bash
cd client
npm run dev  # Development server
npm run build # Production build
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically!

The app is already configured for Vercel deployment with `vercel.json`.

### Other Platforms

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Not required for basic functionality

## Live Demo

🌐 **Live App**: [navigation-assistant-three.vercel.app](https://navigation-assistant-three.vercel.app)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own needs!
