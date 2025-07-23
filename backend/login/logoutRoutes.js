const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { tokenBlacklist } = require('../utils/tokenBlacklist');
const User = require('../model/User');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const token = req.cookies.token;
        tokenBlacklist.add(token);
        res.clearCookie('token', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' 
          });
        res.status(200).json({ message: 'Logout successful' , status: true });
    } catch (error) {
        console.error('Error in logout route:', error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});

module.exports = router;