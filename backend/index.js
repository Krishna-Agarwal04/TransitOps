import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { prisma, pool } from './server/db.js';
import authRoutes from './server/routes/authRoutes.js';
import vehicleRoutes from './server/routes/vehicleRoutes.js';
import driverRoutes from './server/routes/driverRoutes.js';
import tripRoutes from './server/routes/tripRoutes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);

// Health Check Route
app.get('/health', async (req, res) => {
  try {
    // Run a simple query to verify DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'OK',
      timestamp: new Date(),
      services: {
        server: 'up',
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date(),
      services: {
        server: 'up',
        database: 'disconnected'
      },
      error: error.message
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    await pool.end();
    console.log('Prisma client and connection pool disconnected');
  });
});
