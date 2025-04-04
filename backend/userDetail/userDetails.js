const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/User'); // Make sure the User model exists
const router = express.Router();

// Middleware to verify JWT token
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
        if (!token) {
            return res.status(401).json({ error: 'Access denied, token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// GET /user → Returns user profile information
router.get('/', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ status: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user profile', message: error.message });
    }
});

module.exports = router;
