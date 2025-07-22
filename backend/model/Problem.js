const mongoose = require('mongoose');

const testCasesSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    hidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },  // Unique problem title
    problemCode: { type: String, required: true, unique: true },  // Unique problem ID
    description: { type: String, required: true },  // Detailed problem statement
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },  // Difficulty level
    tags: [{ type: String }],  // Tags for categorization (e.g., "Arrays", "Dynamic Programming")
    inputFormat: { type: String, required: true },  // Expected input format
    outputFormat: { type: String, required: true },  // Expected output format
    sampleTestCases: [{
        input: { type: String, required: true },
        output: { type: String, required: true }
    }],  // Sample test cases (visible to user)
    testCases: [testCasesSchema], // Hidden and sample test cases
    constraints: { type: String },  // Constraints on input values
    points: { type: Number, default: 100 }, // Points for this problem
    isPractice: { type: Boolean, default: false } // True if practice problem, false if contest
}, { timestamps: true });

module.exports = mongoose.model('problem', problemSchema);