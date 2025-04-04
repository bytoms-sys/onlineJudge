const express = require('express');
const cors = require('cors');
const Problem = require('../model/Problem');
const Submission = require('../model/submissions');

const router = express.Router();
exports.Router = router;


router.use(cors());
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post('/', async (req, res) => {
    const { userId, problemCode, language, code } = req.body;

    const problem = await Problem.findOne({ problemCode: problemCode });

    if (!userId || !problem || !language || !code) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const submission = await Submission.create({
            user: userId,
            problemCode,
            language,
            code,
            status: 'pending'
        });
        res.status(201).json({ message: 'Submission created successfully', submission });
    } catch (error) {
        res.status(500).json({ message: 'Error creating submission', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const submissionId = req.params.id;

        // Find the submission by ID
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.status(200).json(submission);
    } catch (err) {
        console.error('Error fetching submission:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;