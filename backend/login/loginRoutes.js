const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../model/User');  // Adjust the path based on your actual model location

const router = express.Router();

// Login route
router.post('/', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required', status: false });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format', status: false });
    }
    if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({ error: 'Password must be at least 6 characters', status: false });
    }
  
      // Find user
      const user = await User.findOne({ email }); // Exclude password
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials", status: false });
      }
  
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials', status: false });
      }
  
      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000
      });
  
      // Return user data and token info
      return res.status(200).json({ 
        message: 'Login successful', 
        status: true,
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        },
        expiresIn: 24 * 60 * 60 * 1000
      });
  
    } catch (error) {
      console.error('Error in login route:', error);
      res.status(500).json({ error: 'Server error', status: false });
    }
  });

  module.exports = router;