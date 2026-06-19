import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { verifySupabase, getDbStatus } from './config/supabase.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import postRoutes from './routes/posts.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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

async function start() {
  try {
    await verifySupabase();
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

start();
