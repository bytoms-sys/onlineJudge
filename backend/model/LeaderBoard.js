const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    totalPoints: {
        type: Number,
        default: 0  // Users start with 0 points
    }
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);