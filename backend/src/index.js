import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { verifySupabase, getDbStatus } from './config/supabase.js';
import { corsOptions, getAllowedOrigins } from './config/cors.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import postRoutes from './routes/posts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors(corsOptions()));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const db = getDbStatus();
  res.json({
    ok: db.connected,
    db,
    timezone: 'America/Mexico_City',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postRoutes);

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

async function start() {
  try {
    await verifySupabase();
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
      console.log(`CORS permitido: ${getAllowedOrigins().join(', ')}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

start();
