import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

import { attachUser } from './authMiddleware.js';
import authRoutes from './routes/auth.js';
import materialsRoutes from './routes/materials.js';
import matchesRoutes from './routes/matches.js';
import adminRoutes from './routes/admin.js';
import dashboardRoutes from './routes/dashboard.js';
import geocodeRoutes from './routes/geocode.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  })
);
app.use(attachUser);

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'SWEET Exchange API' }));

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', geocodeRoutes);
app.use('/api', adminRoutes); // /api/users, /api/stats

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`SWEET Exchange API listening on http://localhost:${PORT}`);
});
