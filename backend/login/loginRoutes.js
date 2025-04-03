const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');  // Adjust the path based on your actual model location

const router = express.Router();

// Login route
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'All fields are required', status: false });
        }

        const emailExist = await User.findOne({ email });

        if (!emailExist) {
            return res.status(400).json({ error: "Email doesn't exist! Please register", status: false });
        }

        const isMatch = await bcrypt.compare(password, emailExist.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials', status: false });
        }

        const token = jwt.sign(
            { id: emailExist._id, email: emailExist.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: 'Login successful', status: true });

    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});

module.exports = router;
