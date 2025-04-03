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
    // sampleTestCases: [{  
    //     input: { type: String, required: true },  
    //     output: { type: String, required: true }  
    // }],  // Sample test cases
    testCases: [{ testCasesSchema }],
    constraints: { type: String }
},  // Constraints on input values
    { timestamps: true });


module.exports = mongoose.model('problem', problemSchema); 