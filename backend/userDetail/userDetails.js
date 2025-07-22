const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../model/User'); // Make sure the User model exists
const router = express.Router();

// Middleware to verify JWT token
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
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

router.put('/', authenticateUser, async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { firstName, lastName, email },
            { new: true, runValidators: true }
        ).select('-password');
        res.status(200).json({ status: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile', message: error.message });
    }
});

// POST /userDetails/change-password → Change user password
router.post('/change-password', authenticateUser, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Old password incorrect' });
        }
        if (!validator.isLength(newPassword, { min: 6 })) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ status: true, message: 'Password changed' });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;