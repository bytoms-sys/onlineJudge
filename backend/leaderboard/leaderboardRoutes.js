const express = require('express');
const Leaderboard = require('../model/LeaderBoard');
const User = require('../model/User');
const router = express.Router();

// Get leaderboard (top N users)
router.get('/', async (req, res) => {
    try {
        // Populate user info, sort by totalPoints descending
        const leaderboard = await Leaderboard.find()
            .populate('userId', 'firstName lastName email')
            .sort({ totalPoints: -1 })
            .limit(100);
        res.status(200).json({ status: true, leaderboard });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;