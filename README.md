# ArenaIQ: Smart Venue Experience Platform

ArenaIQ is a real-time, full-stack platform designed to enhance spectator experiences and streamline stadium operations during large-scale events. By leveraging real-time data synchronization, the platform provides fans with critical updates and operational teams with actionable insights.

## Core Features

### Fan Experience
- **Real-Time Scoreboard**: Live updates for game scores and periods.
- **Wait-Time Optimization**: Dynamic monitoring of gate congestion to guide fans to the fastest entry points.
- **Concession Tracking**: Real-time status updates for food and beverage orders.
- **Interactive Navigation**: Integrated seat and venue maps for seamless orientation.

### Operations Management
- **Crowd Density Heatmaps**: Visual monitoring of stand capacity and zone density.
- **Incident Alerts**: Real-time notification system for critical operational updates.
- **Simulation Suite**: "Rush Hour" simulation tool for stress-testing operational responses and fan rerouting.

## Technical Architecture

The platform utilizes a modern real-time architecture:
- **Synchronization Layer**: Socket.IO provides bi-directional, low-latency communication between the server and all connected clients.
- **Data Simulation**: A background process simulates live event data, including scoring fluctuations and fluctuating gate wait times.
- **Responsive Interface**: A unified React codebase serving distinct views optimized for both mobile fans and desktop operators.

## System Elements

### Project Structure
```text
├── arenaiq/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FanView.jsx       # Fan-facing dashboard and alerts
│   │   │   ├── OpsView.jsx       # Operations control panel
│   │   │   └── VenueMap.jsx      # SVG-based interactive map component
│   │   ├── hooks/
│   │   │   └── useSocket.js      # WebSocket connection and state management
│   │   ├── App.jsx               # Application root and role switching logic
│   │   └── index.css             # Design system and global styles
│   ├── server.js                 # Node.js backend & data simulation engine
│   ├── Dockerfile                # Containerization configuration
│   └── cloudbuild.yaml           # CI/CD pipeline for Google Cloud
└── README.md                     # Platform documentation
```

### Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Socket.IO
- **Deployment**: Docker, Google Cloud Run

## Installation and Setup

### Prerequisites
- Node.js (v18+)
- npm

### Local Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development environment (concurrently runs Vite and Node server):
   ```bash
   npm run dev
   ```

### Docker Deployment
The application is optimized for containerized environments:
1. Build the image:
   ```bash
   docker build -t arenaiq .
   ```
2. Run the container:
   ```bash
   docker run -p 8080:8080 arenaiq
   ```

## License
Distributed under the MIT License.
