const mongoose = require('mongoose');
require('dotenv').config()

const DBconnection = async () => {
    const MONGODB_URL = process.env.MONGODB_URI;
    
    try {
        await mongoose.connect(MONGODB_URL);
        console.log('Database connected successfully');
    }
    catch (error) {
        console.log('Database connection failed');
    }
}
module.exports = { DBconnection };