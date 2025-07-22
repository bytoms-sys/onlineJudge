const express = require('express');
const Problem = require('../model/Problem');
//const Submission = require('../model/Submissions');
const Submission = require('../model/Submissions');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
//const { evaluateSubmission } = require('../submissions/submissionRoutes');
const submissionRoutes = require('../submissions/submissionRoutes');
const evaluateSubmission = submissionRoutes.evaluateSubmission;
const redisClient = require('../utils/redisClient');

const router = express.Router();

// Create a new problem (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { title, description, difficulty, tags, inputFormat, outputFormat, constraints, problemCode, points, isPractice } = req.body;

        if (!title || !description || !difficulty || !inputFormat || !outputFormat || !problemCode || !req.body.sampleTestCases || !req.body.testCases) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let sampleTestCases, testCases;
        try {
            sampleTestCases = typeof req.body.sampleTestCases === "string" ? JSON.parse(req.body.sampleTestCases) : req.body.sampleTestCases;
            testCases = typeof req.body.testCases === "string" ? JSON.parse(req.body.testCases) : req.body.testCases;
        } catch (error) {
            return res.status(400).json({ message: 'Invalid JSON format for test cases', error: error.message });
        }

        const tagsArray = typeof tags === "string" ? tags.split(",").map(tag => tag.trim()) : tags;

        const problemExist = await Problem.findOne({ problemCode });

        if (problemExist) {
            return res.status(400).json({ error: 'Problem already exists', status: false });
        }

        const problem = await Problem.create({
            title,
            description,
            difficulty,
            tags: tagsArray,
            inputFormat,
            outputFormat,
            sampleTestCases,
            testCases,
            constraints,
            problemCode,
            points: points || 100,
            isPractice: isPractice === undefined ? false : isPractice
        });

        // Invalidate cache
        await redisClient.del('all_problems');
        await redisClient.del('practice_problems');

        res.status(201).json({ message: 'Problem created successfully', problem });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating problem', error: error.message });
    }
});

// Get all problems (with cache)
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'all_problems';
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const problems = await Problem.find();
        await redisClient.set(cacheKey, JSON.stringify(problems), { EX: 60 }); // Cache for 60 seconds
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching problems', error: error.message });
    }
});

// Get all practice problems (with cache)
router.get('/practice', async (req, res) => {
    try {
        const cacheKey = 'practice_problems';
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const problems = await Problem.find({ isPractice: true });
        await redisClient.set(cacheKey, JSON.stringify(problems), { EX: 60 });
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching practice problems', error: error.message });
    }
});

// Get a problem by problemCode
router.get('/:problemCode', async (req, res) => {
    try {
        const problem = await Problem.findOne({ problemCode: req.params.problemCode });
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json(problem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching problem', error: error.message });
    }
});

// Update a problem by problemCode (admin only)
router.put('/:problemCode', verifyToken, isAdmin, async (req, res) => {
    try {
        let { sampleTestCases, testCases } = req.body;
        try {
            sampleTestCases = typeof sampleTestCases === "string" ? JSON.parse(sampleTestCases) : sampleTestCases;
            testCases = typeof testCases === "string" ? JSON.parse(testCases) : testCases;
        } catch (error) {
            return res.status(400).json({ message: 'Invalid JSON format for test cases', error: error.message });
        }

        const problem = await Problem.findOneAndUpdate(
            { problemCode: req.params.problemCode },
            { ...req.body, sampleTestCases, testCases },
            { new: true, runValidators: true }
        );

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Invalidate cache
        await redisClient.del('all_problems');
        await redisClient.del('practice_problems');

        res.status(200).json({ message: 'Problem updated successfully', problem });

    } catch (error) {
        res.status(500).json({ message: 'Error updating problem', error: error.message });
    }
});

// Delete a problem by problemCode (admin only)
router.delete('/:problemCode', verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedProblem = await Problem.findOneAndDelete({ problemCode: req.params.problemCode });

        if (!deletedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Invalidate cache
        await redisClient.del('all_problems');
        await redisClient.del('practice_problems');

        res.status(200).json({ message: 'Problem deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error deleting problem', error: error.message });
    }
});

// Submit solution to a practice problem
router.post('/:problemCode/submit', verifyToken, async (req, res) => {
    try {
        const { language, code } = req.body;
        const problem = await Problem.findOne({ problemCode: req.params.problemCode, isPractice: true });
        if (!problem) {
            return res.status(404).json({ error: 'Practice problem not found' });
        }
        // Create submission
        const submission = await Submission.create({
            user: req.user.id,
            problemCode: req.params.problemCode,
            language,
            code,
            status: 'pending'
        });

        await redisClient.del('recent_submissions'); // Invalidate cache
        // TODO: Call your evaluation logic here (e.g., evaluateSubmission(submission, problem))
        evaluateSubmission(submission, problem);
        res.status(201).json({ message: 'Practice submission received', submission });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message && error.message.includes('Unsupported language')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;