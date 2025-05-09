const express = require('express');
const cors = require('cors');
const { DBconnection } = require('./database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./model/User');
const cookieParser = require('cookie-parser');
const Problem = require('./model/Problem');

const compilerRoutes = require('./compilerBackend/compilerBackend.js');
const submissionRoutes = require('./submissions/submissionRoutes.js');
const loginRoute = require('./login/loginRoutes');
const logoutRoute = require('./login/logoutRoutes.js');
const registerRoute = require('./register/registerRoutes');
const problemRoute = require('./problem/problemRoutes');
const userDetails = require('./userDetail/userDetails.js')
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from frontend
  credentials: true  // Allow cookies/session authentication
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
DBconnection();

app.get('/', (req, res) => {
  res.send('Welcome to Online compiler');
});

app.use('/compiler', compilerRoutes);

app.use('/submission', submissionRoutes);

app.use('/login', loginRoute); 

app.use('/register', registerRoute);

app.use('/problems', problemRoute);

app.use('/logout', logoutRoute);

app.use('./userDetails', userDetails);
//definining the problems routes

// app.get('/login', (req, res) => {
//   res.send('Hello World! This is login page');
// });

const errorHandler = require('./middleware/errorHandler');
// Add at the end (before app.listen):
app.use(errorHandler);

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});