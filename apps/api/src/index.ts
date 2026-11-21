import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { authRouter } from './features/auth/auth.routes.js';
import { usersRouter } from './features/users/users.routes.js';
import { announcementsRouter } from './features/announcements/announcements.routes.js';
import { scheduleRouter } from './features/schedule/schedule.routes.js';
import { gradesRouter } from './features/grades/grades.routes.js';
import { evaluationsRouter } from './features/evaluations/evaluations.routes.js';
import { homeRouter } from './features/home/home.routes.js';
import { consultationsRouter } from './features/consultations/consultations.routes.js';
import { eventsRouter } from './features/events/events.routes.js';
import { organizationsRouter } from './features/organizations/organizations.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { NotFoundError } from './errors/app-error.js';

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Versioned REST API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/announcements', announcementsRouter);
app.use('/api/v1/schedule', scheduleRouter);
app.use('/api/v1/grades', gradesRouter);
app.use('/api/v1/evaluations', evaluationsRouter);
app.use('/api/v1/home', homeRouter);
app.use('/api/v1/consultations', consultationsRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/organizations', organizationsRouter);

// 404 handler for undefined routes
app.use((_req, _res, next) => {
  next(new NotFoundError('The requested endpoint does not exist.'));
});

// Centralized error handling middleware
app.use(errorHandler);

if (env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`CCS Hub API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

export default app;
