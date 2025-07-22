const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const validator = require('validator');

const router = express.Router();

router.post('/', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if email already exists
        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword
        });

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });
        user.token = token;

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Error in registration route', message: error.message });
    }
});

module.exports = router;