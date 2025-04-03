const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');  // Adjust path based on your actual model location

const router = express.Router();

// Register route
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required', status: false });
        }

        const emailExist = await User.findOne({ email });

        if (emailExist) {
            return res.status(400).json({ error: 'Email already exists, Please login!!', status: false });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            role,
            password: hashPassword
        });

        const token = jwt.sign(
            { id: user._id, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        user.token = token;
        user.password = undefined;

        return res.status(200).json({ message: 'User registered successfully', status: true, user });

    } catch (error) {
        console.error('Error in registration route:', error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});

module.exports = router;
