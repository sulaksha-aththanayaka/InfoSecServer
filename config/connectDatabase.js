const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const mongoURI = process.env.CONNECTION_STRING

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
};

// Call the connectDB function to establish a connection
module.exports = connectDB;
