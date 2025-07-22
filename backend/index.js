const express = require('express');
const cors = require('cors');
const { DBconnection } = require('./database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./model/User');
const cookieParser = require('cookie-parser');
const Problem = require('./model/Problem');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const compilerRoutes = require('./compilerBackend/compilerBackend.js');
const redisClient = require('./utils/redisClient.js');
//const { submissionRoutes } = require('./submissions/submissionRoutes.js');
const submissionRoutes = require('./submissions/submissionRoutes.js');
const loginRoute = require('./login/loginRoutes');
const logoutRoute = require('./login/logoutRoutes.js');
const registerRoute = require('./register/registerRoutes');
const problemRoute = require('./problem/problemRoutes');
const userDetails = require('./userDetail/userDetails.js')
const leaderboardRoutes = require('./leaderboard/leaderboardRoutes.js');
const adminRoutes = require('./admin/adminRoutes.js');
const contestRoutes = require('./contest/contestRoutes.js');
const { submissionQueue } = require('./utils/queueConfig');
const verifyToken = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');
require('dotenv').config();

// --- Rate Limiting ---
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Judge API',
      version: '1.0.0',
      description: 'API Documentation for Online Judge System'
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./problem/*.js', './submissions/*.js', './contest/*.js', './login/*.js', './register/*.js']
};

const app = express();

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(limiter);
app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from frontend
  credentials: true  // Allow cookies/session authentication
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());  // Middleware to parse cookies

DBconnection();

app.get('/', (req, res) => {
  res.send('Welcome to Online compiler');
});

app.get('/admin/queue-stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      submissionQueue.getWaitingCount(),
      submissionQueue.getActiveCount(),
      submissionQueue.getCompletedCount(),
      submissionQueue.getFailedCount()
    ]);
    
    res.json({
      status: true,
      stats: { waiting, active, completed, failed }
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    container: {
      dockerRunning: true // You might want to check Docker status dynamically
    },
    database: {
      connected: mongoose.connection.readyState === 1
    },
    redis: {
      connected: redisClient.isOpen
    }
  };
  
  const statusCode = healthData.database.connected ? 200 : 503;
  res.status(statusCode).json(healthData);
});

app.use('/compiler', compilerRoutes);

app.use('/submission', submissionRoutes);

app.use('/login', loginRoute); 

app.use('/register', registerRoute);

app.use('/problems', problemRoute);

app.use('/logout', logoutRoute);

app.use('/userDetails', userDetails);

app.use('/leaderboard', leaderboardRoutes);

app.use('/admin', adminRoutes);

app.use('/contests', contestRoutes);
//definining the problems routes

// app.get('/login', (req, res) => {
//   res.send('Hello World! This is login page');
// });

const errorHandler = require('./middleware/errorHandler');
// Add at the end (before app.listen):
app.use(errorHandler);

require('./workers/submissionProcessor');

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});