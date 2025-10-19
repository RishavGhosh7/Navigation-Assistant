#!/bin/bash

# Navigation App Startup Script

echo "🚀 Starting Navigation App..."

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  Creating server/.env from template..."
    cp server/.env.example server/.env
    echo "📝 Please edit server/.env and set your JWT_SECRET"
fi

if [ ! -f "client/.env" ]; then
    echo "⚠️  Creating client/.env from template..."
    cp client/.env.example client/.env
    echo "📝 Please edit client/.env and set your VITE_MAPBOX_ACCESS_TOKEN"
fi

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install --legacy-peer-deps && cd ..
fi

# Start backend
echo "🔧 Starting backend server..."
cd server && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
cd ../client && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Navigation App is starting up!"
echo "📊 Backend: http://localhost:3001"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup on exit
echo "🛑 Stopping servers..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ Servers stopped"
