# ArenaIQ - Smart Venue Experience Platform

A real-time full-stack web application designed for large sporting events.

## Features
- **Fan View**: Real-time score ticker, gate wait times, concession status, and a dynamic seat navigation map.
- **Ops View**: Real-time crowd density monitoring, alerts, and rush hour simulation.
- **Real-Time Data**: Powered by Socket.IO, updates are pushed instantly across connected clients.

## Running Locally (Docker)

This app is designed to be packaged and run as a single Docker container, perfect for Google Cloud Run.

### 1. Build the Docker Image
```bash
docker build -t arenaiq .
```

### 2. Run the Container
```bash
docker run -p 8080:8080 arenaiq
```

### 3. View the App
Open your browser and navigate to `http://localhost:8080`.
Open two windows—one set to **Fan View** and one to **Ops View**. Click "SIMULATE RUSH HOUR" in the Ops View to see the real-time updates broadcast to the Fan View!

## Running Locally (Development)
```bash
npm install
npm run dev
```
