const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');  // Adjust the path based on your actual model location

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None' });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error in logout route:', error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});

module.exports = router;