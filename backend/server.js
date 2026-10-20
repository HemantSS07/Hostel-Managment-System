import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Useful to join student-specific channels 
  socket.on('join_student', (studentId) => {
    socket.join(studentId);
    console.log(`Student ${studentId} joined their room`);
  });

  socket.on('join_admin', () => {
    socket.join('admins');
    console.log('Admin joined admins room');
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});