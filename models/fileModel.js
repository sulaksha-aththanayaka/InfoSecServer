const mongoose = require('mongoose');

// Define the schema
const fileDataSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    key: { type: String, required: true },
    iv: { type: String, required: true },
}, { timestamps: true }); // Optionally add timestamps

// Create the model
const FileData = mongoose.model('File', fileDataSchema);

module.exports = FileData;
