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
import { Logging } from '@google-cloud/logging';
import xss from 'xss-clean';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Parse JSON bodies ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Security Headers via Helmet ────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'ws:'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' },
    xXssProtection: false, // rely on CSP instead
  })
);

// ── Compression ───────────────────────────────────────────────
app.use(compression({ level: 6, threshold: 1024 }));

// ── XSS clean ────────────────────────────────────────────────
app.use(xss());

// ── CORS ──────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// ── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── Stricter rate limit for API endpoints ─────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Initialize Google Cloud Logging ──────────────────────────
const logging = new Logging();
const log = logging.log('arenaiq-server-log');

/**
 * Writes a structured log entry to Google Cloud Logging.
 * @param {string} message - Log message
 * @param {'INFO'|'WARNING'|'ERROR'} severity - Log severity
 * @param {object} [labels] - Optional additional labels
 */
async function writeLog(message, severity = 'INFO', labels = {}) {
  try {
    const metadata = {
      resource: { type: 'global' },
      severity,
      labels: { service: 'arenaiq', ...labels },
    };
    const entry = log.entry(metadata, { message });
    await log.write(entry);
  } catch (err) {
    // Don't let logging failures crash the server
    console.error('[Cloud Logging error]', err.message);
  }
}

// ── HTTP Server + Socket.IO ───────────────────────────────────
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
  },
  // Limit socket payload to prevent abuse
  maxHttpBufferSize: 1e4,
});

// ── Initialize Gemini AI ──────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_API_KEY) {
  console.warn('[ArenaIQ] GEMINI_API_KEY is not set — AI insights will be disabled.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Serve Static Files from dist (Vite build) ─────────────────
app.use(
  express.static(path.join(__dirname, 'dist'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  })
);

// ── Health Check Endpoint ─────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.0.0',
  });
});

// ── API: Current Game State ───────────────────────────────────
app.get('/api/state', apiLimiter, (req, res) => {
  res.json(gameState);
});

// ── Simulated Data State ──────────────────────────────────────
/** @type {import('./types.js').GameState} */
const gameState = {
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
  aiInsight: 'Gathering stadium data…',
};

/**
 * Derives gate status from wait time.
 * @param {number} waitTime - Wait time in minutes
 * @returns {'green'|'amber'|'red'}
 */
function deriveGateStatus(waitTime) {
  if (waitTime < 10) return 'green';
  if (waitTime < 20) return 'amber';
  return 'red';
}

/**
 * Generates an AI insight using Google Gemini based on the current game state.
 * Logs success and error to Google Cloud Logging.
 * @returns {Promise<void>}
 */
async function generateInsights() {
  if (!GEMINI_API_KEY) {
    gameState.aiInsight = 'AI insights require a valid GEMINI_API_KEY.';
    return;
  }

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

    await writeLog(
      `AI insight generated: ${response.text.substring(0, 80)}…`,
      'INFO',
      { event: 'ai_insight' }
    );
  } catch (err) {
    console.error('[ArenaIQ] Error generating insights:', err.message);
    gameState.aiInsight = 'AI temporarily unavailable.';
    await writeLog(err.message, 'ERROR', { event: 'ai_insight_error' });
  }
}

// Generate insights initially and every 30 seconds
generateInsights();
setInterval(generateInsights, 30000);

// ── Data Simulation Loop ──────────────────────────────────────
setInterval(() => {
  if (Math.random() > 0.6) {
    gameState.score.home += Math.floor(Math.random() * 3);
  }
  if (Math.random() > 0.6) {
    gameState.score.away += Math.floor(Math.random() * 3);
  }

  Object.keys(gameState.gates).forEach((gate) => {
    const diff = Math.floor(Math.random() * 5) - 2; // -2 to +2
    gameState.gates[gate].waitTime = Math.max(0, gameState.gates[gate].waitTime + diff);
    gameState.gates[gate].status = deriveGateStatus(gameState.gates[gate].waitTime);
  });

  io.emit('state_update', gameState);
}, 5000);

// ── Socket.IO Connection Handling ────────────────────────────
io.on('connection', (socket) => {
  console.log('[ArenaIQ] Client connected:', socket.id);
  writeLog(`Client connected: ${socket.id}`, 'INFO', { event: 'socket_connect' });

  // Send current state immediately on connect
  socket.emit('state_update', gameState);

  socket.on('simulate_rush', async () => {
    console.log('[ArenaIQ] Rush hour simulated by:', socket.id);
    writeLog(`Rush hour simulated by: ${socket.id}`, 'WARNING', { event: 'simulate_rush' });

    gameState.zones.North.density = 91;
    gameState.zones.North.status = 'critical';

    gameState.gates.A.waitTime = 35;
    gameState.gates.A.status = deriveGateStatus(35);
    gameState.gates.C.waitTime = 3;
    gameState.gates.C.status = deriveGateStatus(3);

    gameState.alerts.push({
      id: Date.now(),
      message: 'North Stand 91% — reroute fans to East Gate',
      level: 'critical',
      time: new Date().toLocaleTimeString(),
    });

    // Keep at most 5 alerts
    if (gameState.alerts.length > 5) gameState.alerts.shift();

    io.emit('state_update', gameState);
    io.emit('fan_alert', {
      message: 'North Stand is 91% full. Use Gate C — 3 min wait.',
    });

    // Trigger immediate AI insight on rush hour
    await generateInsights();
    io.emit('state_update', gameState);
  });

  socket.on('disconnect', (reason) => {
    console.log('[ArenaIQ] Client disconnected:', socket.id, reason);
    writeLog(`Client disconnected: ${socket.id} (${reason})`, 'INFO', { event: 'socket_disconnect' });
  });

  socket.on('error', (err) => {
    console.error('[ArenaIQ] Socket error:', err.message);
    writeLog(`Socket error: ${err.message}`, 'ERROR', { event: 'socket_error' });
  });
});

// ── SPA fallback ──────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  console.error('[ArenaIQ] Unhandled error:', err.message);
  writeLog(err.message, 'ERROR', { event: 'unhandled_error', path: req.path });
  res.status(status).json({
    error: status < 500 ? err.message : 'Internal server error',
  });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8080', 10);
httpServer.listen(PORT, () => {
  console.log(`[ArenaIQ] Server listening on port ${PORT}`);
  writeLog(`Server started on port ${PORT}`, 'INFO', { event: 'server_start' });
});
