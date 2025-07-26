const express = require('express');
const router = express.Router();
const User = require('../model/User');
const Problem = require('../model/Problem');
const Submission = require('../model/Submissions');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Get all users (admin only)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ status: true, users });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

// Delete a user by ID (admin only)
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

// Promote a user to admin (admin only)
router.post('/users/:id/promote', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: 'admin' },
            { new: true }
        );
        res.status(200).json({ status: true, message: 'User promoted to admin', user });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalProblems = await Problem.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const acceptedSubmissions = await Submission.countDocuments({ status: 'Accepted' });
    const acceptanceRate = totalSubmissions
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : 0;

    res.json({
      status: true,
      stats: {
        totalProblems,
        totalUsers,
        totalSubmissions,
        acceptanceRate
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

module.exports = router;