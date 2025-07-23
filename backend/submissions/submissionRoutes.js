const express = require('express');
const cors = require('cors');
const Problem = require('../model/Problem');
const Submission = require('../model/Submissions');
const LeaderBoard = require('../model/LeaderBoard');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { executeCode } = require('../compilerBackend/executeCode');
const { submissionQueue } = require('../utils/queueConfig');
const redisClient = require('../utils/redisClient');

const router = express.Router();

// router.use(cors());
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Helper: Evaluate a submission with detailed status handling
async function evaluateSubmission(submission, problem) {
    let passedCases = 0;
    const totalCases = problem.testCases.length;
    let status = 'Accepted';

    function normalizeOutput(str) {
    // Handle non-string inputs
    if (typeof str !== 'string') {
        str = String(str);
    }
    
    return str.replace(/\s+/g, ' ').trim();
}
    for (const testCase of problem.testCases) {
        try {
            const output = await executeCode(submission.code, submission.language, testCase.input);
            console.log(`Test case: Expected "${testCase.output}" (${testCase.output.length}), Got "${output}" (${output.length})`);
            const normalizedOutput = normalizeOutput(output);
            const normalizedExpected = normalizeOutput(testCase.output);

            console.log(`Normalized: Expected "${normalizedExpected}", Got "${normalizedOutput}"`);

            if (normalizedOutput === normalizedExpected) {
                passedCases++;
                console.log('Test case passed!');
            } else {
                status = 'Wrong Answer';
                console.log('Test case failed!');
                console.log(`JSON comparison: ${JSON.stringify(normalizedOutput)} === ${JSON.stringify(normalizedExpected)}`);
                console.log(`Character codes: ${[...normalizedOutput].map(c => c.charCodeAt(0))} vs ${[...normalizedExpected].map(c => c.charCodeAt(0))}`);
            }
        } catch (err) {
            const errMsg = err.toString().toLowerCase();
            if (errMsg.includes('timeout')) {
                status = 'Time Limit Exceeded';
            } else if (errMsg.includes('compilation') || errMsg.includes('compile')) {
                status = 'Compilation Error';
            } else {
                status = 'Runtime Error';
            }
            break; // Stop further test cases on error
        }
    }

    if (status === 'Accepted' && passedCases < totalCases) {
        status = passedCases > 0 ? 'Partially Accepted' : 'Wrong Answer';
    }

    // Update submission status
    submission.status = status;
    submission.passedTestCases = passedCases;
    submission.totalTestCases = totalCases;
    await submission.save();

    // Update leaderboard if accepted and NOT a practice problem
    if (status === 'Accepted') {
        const problemDoc = await Problem.findOne({ problemCode: submission.problemCode });
        if (problemDoc && !problemDoc.isPractice) {
            const points = problemDoc.points || 100;
            let lb = await LeaderBoard.findOne({ userId: submission.user });
            if (!lb) {
                lb = await LeaderBoard.create({ userId: submission.user, totalPoints: points });
            } else {
                lb.totalPoints += points;
                await lb.save();
            }
        }
    }
}

// Define the new route
// GET /submission/stats/:userId
// router.get('/stats/:userId', verifyToken, async (req, res) => {
//     try {
//         const { userId } = req.params;

//         // Example: Count submissions by status
//         const totalSubmissions = await Submission.countDocuments({ userId: userId });
//         const acceptedCount = await Submission.countDocuments({ userId: userId, status: 'Accepted' });
//         const failedCount = await Submission.countDocuments({ userId: userId, status: { $ne: 'Accepted' } });
        
//         // Ensure user is authorized to see this data if needed
//         if (req.user.id !== userId) {
//             return res.status(403).json({ error: 'Forbidden' });
//         }
        
//         res.status(200).json({
//             status: true,
//             stats: {
//                 total: totalSubmissions,
//                 accepted: acceptedCount,
//                 failed: failedCount
//             }
//         });

//     } catch (error) {
//         res.status(500).json({ status: false, error: 'Error fetching submission stats', message: error.message });
//     }
// });
router.get('/stats/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow the user or admin to see this
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const submissions = await Submission.find({ user: userId });
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;

    // Unique problems solved
    const solvedProblems = new Set();
    submissions.forEach(s => {
      if (s.status === 'Accepted') solvedProblems.add(s.problemCode);
    });

    // Recent submissions (last 5)
    const recentSubmissions = await Submission.find({ user: userId })
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('problemCode status submittedAt');

    res.status(200).json({
      totalSubmissions,
      acceptedSubmissions,
      successRate: totalSubmissions ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
      problemsSolved: solvedProblems.size,
      recentSubmissions
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});
// Submit solution to any problem (contest or practice)
router.post('/', async (req, res) => {
    const { userId, problemCode, language, code } = req.body;

    // Basic input validation (prevents NoSQL injection and bad data)
    if (
        !userId || typeof userId !== 'string' ||
        !problemCode || typeof problemCode !== 'string' ||
        !language || typeof language !== 'string' ||
        !code || typeof code !== 'string'
    ) {
        return res.status(400).json({ message: 'All fields are required and must be strings' });
    }

    const problem = await Problem.findOne({ problemCode: problemCode });
    if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
    }

    try {
        const submission = await Submission.create({
            user: userId,
            problemCode,
            language,
            code,
            status: 'pending'
        });

        // Add to queue instead of evaluating immediately
        await submissionQueue.add({
            submissionId: submission._id,
            problemCode: problemCode
        }, {
            attempts: 3,  // Number of retry attempts
            backoff: {    // Exponential backoff strategy
                type: 'exponential',
                delay: 1000 // Initial delay in ms
            }
        });

        await redisClient.del('recent_submissions'); // Invalidate cache

        res.status(201).json({ 
            message: 'Submission queued successfully', 
            status: true,
            submission 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating submission', error: error.message });
    }
});

// Submit solution to a practice problem (recommended endpoint)
router.post('/practice/:problemCode', async (req, res) => {
    const { userId, language, code } = req.body;

    if (
        !userId || typeof userId !== 'string' ||
        !language || typeof language !== 'string' ||
        !code || typeof code !== 'string'
    ) {
        return res.status(400).json({ message: 'All fields are required and must be strings' });
    }

    const problem = await Problem.findOne({ problemCode: req.params.problemCode, isPractice: true });
    if (!problem) {
        return res.status(404).json({ message: 'Practice problem not found' });
    }

    try {
        const submission = await Submission.create({
            user: userId,
            problemCode: req.params.problemCode,
            language,
            code,
            status: 'pending'
        });

        // Add to queue
        await submissionQueue.add({
            submissionId: submission._id,
            problemCode: req.params.problemCode,
            isPractice: true
        });

        await redisClient.del('recent_submissions'); // Invalidate cache

        res.status(201).json({ message: 'Practice submission queued', submission });
    } catch (error) {
        res.status(500).json({ message: 'Error creating practice submission', error: error.message });
    }
});

router.get('/recent', async (req, res) => {
    //console.log('GET /submission/recent called');
    try {
        const cacheKey = 'recent_submissions';
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const submissions = await Submission.find()
            .sort({ submittedAt: -1 })
            .limit(10)
            .populate('user', 'firstName lastName email');

        await redisClient.set(cacheKey, JSON.stringify(submissions), { EX: 30 });
        //console.log('Submissions found:', submissions);
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Get a submission by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const submissionId = req.params.id;
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        if (
            submission.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        res.status(200).json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all submissions by user
router.get('/user/:userId', async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.params.userId });
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
});

// router.get('/recent', async (req, res) => {
//     console.log('GET /submission/recent called');
//     try {
//         const submissions = await Submission.find()
//             .sort({ submittedAt: -1 })
//             .limit(10)
//             .populate('user', 'firstName lastName email');
//         console.log('Submissions found:', submissions);
//         res.status(200).json(submissions);
//     } catch (error) {
//         console.error('Error in /submission/recent:', error);
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
// });

// router.get('/recent', async (req, res) => {
//     try {
//         const submissions = await Submission.find()
//             .sort({ submittedAt: -1 }) // Sort by submission time, latest first
//             .limit(2)
//         res.status(200).json(submissions);
//     } catch (error) {
//         console.error('Error in /submission/recent:', error);
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
// });

router.evaluateSubmission = evaluateSubmission;
module.exports = router;