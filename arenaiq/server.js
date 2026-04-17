import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and Efficiency Middlewares
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: '*', // For development. In production, restrict to specific domains.
    methods: ['GET', 'POST'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize Gemini AI
// Fallback to empty string if missing
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Serve static files from dist (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Simulated Data State
let gameState = {
  score: { home: 102, away: 98 },
  time: '4th Qtr 02:45',
  gates: {
    A: { waitTime: 5, status: 'green' },
    B: { waitTime: 12, status: 'amber' },
    C: { waitTime: 3, status: 'green' },
    D: { waitTime: 25, status: 'red' },
  },
  zones: {
    North: { density: 45, status: 'normal' },
    South: { density: 60, status: 'normal' },
    East: { density: 30, status: 'normal' },
    West: { density: 75, status: 'amber' },
  },
  alerts: [],
  foodOrders: [
    { id: 101, status: 'Placed' },
    { id: 102, status: 'Preparing' },
    { id: 103, status: 'Ready' },
  ],
  aiInsight: 'Gathering stadium data...',
};

/**
 * Generates an AI insight using Gemini based on the current game state.
 * @returns {Promise<void>}
 */
async function generateInsights() {
  try {
    const prompt = `You are an AI venue operations assistant. The current stadium state is:
Score: Home ${gameState.score.home} - Away ${gameState.score.away}
Time: ${gameState.time}
Gates Wait Times: A=${gameState.gates.A.waitTime}m, B=${gameState.gates.B.waitTime}m, C=${gameState.gates.C.waitTime}m, D=${gameState.gates.D.waitTime}m
Zone Densities: North=${gameState.zones.North.density}%, South=${gameState.zones.South.density}%, East=${gameState.zones.East.density}%, West=${gameState.zones.West.density}%

Give a concise 1-sentence recommendation to the ops team to optimize crowd flow or fan experience. Make it sound professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    gameState.aiInsight = response.text;
  } catch (err) {
    console.error('Error generating insights:', err);
    gameState.aiInsight = 'AI temporarily unavailable.';
  }
}

// Generate insights initially and every 30 seconds
generateInsights();
setInterval(generateInsights, 30000);

// Data simulation loop
setInterval(() => {
  if (Math.random() > 0.6) {
    gameState.score.home += Math.floor(Math.random() * 3);
  }
  if (Math.random() > 0.6) {
    gameState.score.away += Math.floor(Math.random() * 3);
  }

  Object.keys(gameState.gates).forEach((gate) => {
    let diff = Math.floor(Math.random() * 5) - 2; // -2 to +2
    gameState.gates[gate].waitTime = Math.max(0, gameState.gates[gate].waitTime + diff);

    const w = gameState.gates[gate].waitTime;
    if (w < 10) gameState.gates[gate].status = 'green';
    else if (w < 20) gameState.gates[gate].status = 'amber';
    else gameState.gates[gate].status = 'red';
  });

  io.emit('state_update', gameState);
}, 5000);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('state_update', gameState);

  socket.on('simulate_rush', () => {
    console.log('Rush hour simulated!');

    gameState.zones.North.density = 91;
    gameState.zones.North.status = 'critical';

    gameState.gates.A.waitTime = 35;
    gameState.gates.A.status = 'red';
    gameState.gates.C.waitTime = 3;
    gameState.gates.C.status = 'green';

    gameState.alerts.push({
      id: Date.now(),
      message: 'North Stand 91% — reroute to East Gate',
      level: 'critical',
      time: new Date().toLocaleTimeString(),
    });

    if (gameState.alerts.length > 5) gameState.alerts.shift();

    io.emit('state_update', gameState);
    io.emit('fan_alert', {
      message: 'North Stand is 91% full. Use Gate C — 3 min wait.',
    });

    // Trigger immediate AI insight on rush hour
    generateInsights().then(() => {
      io.emit('state_update', gameState);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
