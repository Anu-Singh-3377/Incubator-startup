import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import authRoutes from './routes/auth.routes.js';
import communicationRoutes from './routes/communication.routes.js';
import { getUsers } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');
const CLIENT_DIST = path.resolve(ROOT_DIR, 'dist');

// Load the single root .env file
dotenv.config({ path: path.resolve(ROOT_DIR, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve static frontend build if available
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  console.log(`[Static] Serving frontend from ${CLIENT_DIST}`);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/communication', communicationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    incubator: 'VentureBharat Incubation Center (AIC - DST Recognized)',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Incubation Center Stats Endpoint
app.get('/api/incubator/stats', (req, res) => {
  const users = getUsers();
  const founders = users.filter(u => u.role === 'founder').length;
  const mentors = users.filter(u => u.role === 'mentor').length;

  res.status(200).json({
    name: 'VentureBharat Incubation & Innovation Foundation',
    affiliation: 'Supported by Startup India, AIM (NITI Aayog) & DST',
    stats: {
      totalStartupsIncubated: 248,
      activeCohortSize: founders + 32,
      mentorsNetwork: mentors + 120,
      totalGrantsDisbursed: '₹34.8 Cr',
      patentsFiled: 87,
      openCohort: 'Cohort 13 - Applications Closing Soon',
      seedFundSchemes: ['SISFS', 'NIDHI-PRAYAS', 'NIDHI-EIR', 'BIG-BIRAC']
    }
  });
});

// Fallback for Single Page Application or 404 API
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API Route not found: ${req.method} ${req.url}`
    });
  }

  const indexPath = path.join(CLIENT_DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.status(404).json({
    success: false,
    message: 'Frontend build not found. Please run `npm run build:client` or start dev server.'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred on the incubation server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🇮🇳 VentureBharat Incubation Portal Backend Started!`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth/login`);
  console.log(`======================================================\n`);
});
