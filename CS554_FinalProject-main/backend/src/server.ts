import express, {Application} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import redisClient from './config/redis';
import { initMinIO } from './config/minio';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import fileRoutes from './routes/files';
import workoutRoutes from './routes/workout';
import mealRoutes from './routes/meals';
import progressRoutes from './routes/progress';
import postRoutes from './routes/posts';

dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()): [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/posts', postRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();
        await redisClient.connect();
        await redisClient.ping();
        await initMinIO();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
});

process.on('SIGTERM', () => {
    process.exit(0);
});

startServer();

export default app;