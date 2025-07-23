const express = require('express');
const mongoose = require('mongoose');
const Contest = require('../model/Contest');
const Problem = require('../model/Problem');
const Submission = require('../model/Submissions');
const User = require('../model/User');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const redisClient = require('../utils/redisClient');
//const { evaluateSubmission } = require('../submissions/submissionRoutes');
const submissionRoutes = require('../submissions/submissionRoutes');
const evaluateSubmission = submissionRoutes.evaluateSubmission;

const router = express.Router();

// Create a contest (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, description, startTime, endTime, problems } = req.body;
        if (!name || !startTime || !endTime || !Array.isArray(problems)) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const contest = await Contest.create({ name, description, startTime, endTime, problems });
        res.status(201).json({ message: 'Contest created', contest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all contests
router.get('/', async (req, res) => {
    try {
        const contests = await Contest.find().populate('problems');
        res.status(200).json(contests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get contest details
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('problems');
        if (!contest) return res.status(404).json({ error: 'Contest not found' });

        console.log('req.user.id:', req.user.id);
        console.log('participants:', contest.participants.map(p => p.toString()));

        let isRegistered = false;
        if (req.user && contest.participants.some(p =>
            (typeof p.equals === 'function' ? p.equals(req.user.id) : p === req.user.id)
        )) {
            isRegistered = true;
        }

        res.status(200).json({ ...(contest.toObject ? contest.toObject() : contest), isRegistered });
    } catch (error) {
        console.error(error); // <--- Add this
        res.status(500).json({ error: error.message });
    }
});

// Register a user for a contest
router.post('/:id/register', verifyToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ error: 'Contest not found' });

        const now = new Date();
        if (now > contest.endTime) {
            return res.status(400).json({ error: 'Contest is not active' });
        }

        // Check if user already registered
        if (contest.participants.includes(req.user.id)) {
            return res.status(400).json({ error: 'Already registered for this contest' });
        }

        contest.participants.push(req.user.id);
        await contest.save();

        res.status(200).json({ message: 'Registered for contest successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit solution to a contest problem
router.post('/:id/submit', verifyToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        const contest = await Contest.findById(req.params.id).populate('problems');
        if (!contest) return res.status(404).json({ error: 'Contest not found' });

        // Check contest time
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(400).json({ error: 'Contest is not active' });
        }

        // Check if user is registered
        if (!contest.participants.includes(req.user.id)) {
            return res.status(403).json({ error: 'You are not registered for this contest' });
        }

        const { problemCode, language, code } = req.body;
        if (!problemCode || !language || !code) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if problem belongs to contest
        const problem = contest.problems.find(p => p.problemCode === problemCode);
        if (!problem) {
            return res.status(400).json({ error: 'Problem not part of this contest' });
        }

        // Create submission
        const submission = await Submission.create({
            user: req.user.id,
            problemCode,
            language,
            code,
            status: 'pending',
            contest: contest._id
        });

        await redisClient.del('recent_submissions'); // Invalidate cache

        // Invalidate leaderboard cache for this contest
        await redisClient.del(`contest_${contest._id}_leaderboard`);

        const dbProblem = await Problem.findOne({ problemCode });
        if (!dbProblem) {
            return res.status(400).json({ error: 'Problem not found' });
        } 

        // Evaluate asynchronously (implement or import your evaluateSubmission logic)
        evaluateSubmission(submission, dbProblem);

        res.status(201).json({ message: 'Submission received', submission });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Contest leaderboard with points, tiebreaker, and Redis cache
router.get('/:id/leaderboard', async (req, res) => {
    try {
        const contestId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        const cacheKey = `contest_${contestId}_leaderboard`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        // Get all accepted submissions for this contest
        const submissions = await Submission.find({
            contest: contestId,
            status: 'Accepted'
        }).sort({ submittedAt: 1 }); // For tiebreaker

        // Get all problems for this contest with their points
        const contest = await Contest.findById(contestId).populate('problems');
        if (!contest) return res.status(404).json({ error: 'Contest not found' });

        const problemPoints = {};
        contest.problems.forEach(p => {
            problemPoints[p.problemCode] = p.points || 100; // Default 100 if not set
        });

        // Map: userId -> { totalPoints, lastAcceptedTime, solvedProblems }
        const userStats = {};
        submissions.forEach(sub => {
            const userId = sub.user.toString();
            if (!userStats[userId]) {
                userStats[userId] = {
                    totalPoints: 0,
                    lastAcceptedTime: sub.submittedAt,
                    solvedProblems: new Set()
                };
            }
            // Only count first accepted submission per problem
            if (!userStats[userId].solvedProblems.has(sub.problemCode)) {
                userStats[userId].totalPoints += problemPoints[sub.problemCode] || 100;
                userStats[userId].solvedProblems.add(sub.problemCode);
                userStats[userId].lastAcceptedTime = sub.submittedAt;
            }
        });

        // Build leaderboard array
        const leaderboard = [];
        for (const userId in userStats) {
            leaderboard.push({
                userId,
                totalPoints: userStats[userId].totalPoints,
                lastAcceptedTime: userStats[userId].lastAcceptedTime
            });
        }

        // Sort: by totalPoints desc, then by lastAcceptedTime asc
        leaderboard.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return new Date(a.lastAcceptedTime) - new Date(b.lastAcceptedTime);
        });

        // Populate user info
        const populated = await Promise.all(
            leaderboard.map(async entry => {
                const user = await User.findById(entry.userId).select('firstName lastName email');
                return {
                    user: user ? {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    } : null,
                    totalPoints: entry.totalPoints,
                    lastAcceptedTime: entry.lastAcceptedTime
                };
            })
        );

        // Cache the leaderboard for 60 seconds
        await redisClient.set(cacheKey, JSON.stringify({ status: true, leaderboard: populated }), { EX: 60 });

        res.status(200).json({ status: true, leaderboard: populated });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

// Update contest details (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        const updatedContest = await Contest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedContest) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        res.status(200).json({ message: 'Contest updated successfully', contest: updatedContest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a contest (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        const deletedContest = await Contest.findByIdAndDelete(req.params.id);
        if (!deletedContest) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        res.status(200).json({ message: 'Contest deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all submissions for a contest (admin only)
router.get('/:id/submissions', verifyToken, isAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        const submissions = await Submission.find({ contest: req.params.id });
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;