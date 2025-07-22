const { submissionQueue } = require('../utils/queueConfig');
const Submission = require('../model/Submissions');
const Problem = require('../model/Problem');
const LeaderBoard = require('../model/LeaderBoard');
const { executeCode } = require('../compilerBackend/executeCode');

// Helper function to normalize output
function normalizeOutput(str) {
    if (typeof str !== 'string') {
        str = String(str);
    }
    return str.replace(/\s+/g, ' ').trim();
}

// Process submissions from queue
submissionQueue.process(async (job) => {
    console.log(`Processing submission job ${job.id}`);
    const { submissionId, problemCode } = job.data;

    try {
        // Fetch submission and problem data
        const submission = await Submission.findById(submissionId);
        const problem = await Problem.findOne({ problemCode });
        
        if (!submission || !problem) {
            throw new Error('Submission or problem not found');
        }
        
        console.log(`Processing submission ${submissionId} for problem ${problemCode}`);

        // Evaluate submission
        let passedCases = 0;
        const totalCases = problem.testCases.length;
        let status = 'Accepted';
        
        // Set job progress to 0%
        await job.progress(0);

        for (let i = 0; i < problem.testCases.length; i++) {
            const testCase = problem.testCases[i];
            try {
                const output = await executeCode(submission.code, submission.language, testCase.input);
                const normalizedOutput = normalizeOutput(output);
                const normalizedExpected = normalizeOutput(testCase.output);

                if (normalizedOutput === normalizedExpected) {
                    passedCases++;
                } else {
                    status = 'Wrong Answer';
                }
                
                // Update progress
                await job.progress(Math.floor((i + 1) * 100 / totalCases));
                
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
            if (!problem.isPractice) {
                const points = problem.points || 100;
                let lb = await LeaderBoard.findOne({ userId: submission.user });
                if (!lb) {
                    lb = await LeaderBoard.create({ userId: submission.user, totalPoints: points });
                } else {
                    lb.totalPoints += points;
                    await lb.save();
                }
            }
        }

        console.log(`Submission ${submissionId} processed - Status: ${status}`);
        return { status, passedCases, totalCases };
        
    } catch (error) {
        console.error(`Error processing submission ${submissionId}:`, error);
        throw error;
    }
});

console.log('Submission queue processor started');