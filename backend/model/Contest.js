const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'problem' }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
}, { timestamps: true });

module.exports = mongoose.model('contest', contestSchema);