import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { publicRoutes } from './routes/public.routes.js';
import { donorRoutes } from './routes/donor.routes.js';
import { volunteerRoutes } from './routes/volunteer.routes.js';
import { staffRoutes } from './routes/staff.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(cors({ origin: env.clientOrigin }));
// Default 100kb is too small for a payment-proof screenshot sent as a
// data: URL — the frontend downsizes the image first, but a raised limit
// still leaves headroom without opening the door to huge payloads.
app.use(express.json({ limit: '8mb' }));
app.use(morgan('dev'));

// No Supabase call here on purpose — lets a deploy platform's health check
// pass even if the database is briefly unreachable.
app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);
