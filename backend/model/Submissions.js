const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  
        required: true 
    },
    problemCode: { 
        type: String,  // Store `problemCode` from the `Problem` collection
        required: true 
    },
    language: { 
        type: String, 
        enum: ['python', 'javascript', 'java', 'c++', 'c', 'ruby', 'go'], 
        required: true 
    },
    code: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'pending'],
        required: true 
    },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'contest' },
    executionTime: { type: Number },
    memoryUsed: { type: Number },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
