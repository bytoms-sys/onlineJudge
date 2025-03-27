const mongoose = require('mongoose');

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
    }],  // Sample test cases
    testCases: [{  
        input: { type: String, required: true },  
        output: { type: String, required: true }  
    }],  // Hidden test cases for evaluation
    constraints: { type: String },  // Constraints on input values
    //createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the user/admin who created it
    //createdAt: { type: Date, default: Date.now }  // Timestamp
});


module.exports = mongoose.model('problem', problemSchema); 