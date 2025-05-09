const express = require('express');
const Problem = require('../model/Problem');  // Adjust path based on your actual model location
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Create a new problem
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { title, description, difficulty, tags, inputFormat, outputFormat, constraints, problemCode } = req.body;

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
            title, description, difficulty, tags: tagsArray, inputFormat, outputFormat, sampleTestCases, testCases, constraints, problemCode
        });

        res.status(201).json({ message: 'Problem created successfully', problem });

    } catch (error) {
        res.status(500).json({ message: 'Error creating problem', error: error.message });
    }
});

// Get all problems
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching problems', error: error.message });
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

// Update a problem by problemCode
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

        res.status(200).json({ message: 'Problem updated successfully', problem });

    } catch (error) {
        res.status(500).json({ message: 'Error updating problem', error: error.message });
    }
});

// Delete a problem by problemCode
router.delete('/:problemCode', verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedProblem = await Problem.findOneAndDelete({ problemCode: req.params.problemCode });

        if (!deletedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json({ message: 'Problem deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error deleting problem', error: error.message });
    }
});

module.exports = router;
