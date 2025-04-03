const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role : {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    submissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'submission',
        },
    ],
});

module.exports = mongoose.model('user', userSchema);