const express = require("express");
const { fileUpload } = require("../multer/uplodFiles");
const { MulterError } = require("multer");
const submitFile = express.Router();
const fs = require("fs");
const path = require("path");
const FileData = require("../models/fileModel");
const crypto = require('crypto');
const { log } = require("console");

const findMulterError = () => {
    return (err, req, res, next) => {
        if (err instanceof MulterError) {
            return res.json({ status: false, message: "File is too large. CV submission failed !" });
        } else if (err instanceof Error) {
            return res.json({ status: false, message: "File type is not allowed. CV submission failed !" });
        }
        next();
    }
}

submitFile.route("/file/submitFile")
    .post(
        fileUpload.single("file"),
        findMulterError(),
        async function (req, res) {
            try {
                if (req?.file) {
                    // Log the index number
                    console.log(req.body.index);
                    console.log("File is Uploaded");

                    const { encrypted, key, iv} = req.body; // Get encrypted data from body

                    // Create a new document using the model
                    const fileData = new FileData({
                        filename: req.file.filename, // Use the uploaded file's filename
                        key: key, // The key you want to save
                        iv: iv // The IV you want to save
                    });

                    // Save the document to the database
                    await fileData.save();

                    return res.json({
                        status: true,
                        message: "Submitted Successfully"
                    });
                } else {
                    console.log(req.body.index);
                    console.log("File is not Uploaded");
                    return res.json({ status: false, message: "File is not Uploaded" });
                }
            } catch (err) {
                console.error(err);
                return res.json({ status: false, message: "Server Error. Please try again" });
            }
        });


function base64ToUint8Array(base64Iv) {
        // Decode the base64 string to binary string
        const binaryString = atob(base64Iv);
            
        // Create a Uint8Array from the binary string
        const length = binaryString.length;
        const bytes = new Uint8Array(length);
            
        for (let i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
            
        return bytes; // This will be a Uint8Array
}

const decrypt = (encryptedBuffer, base64Key, base64Iv) => {
    // Decode Base64 key and IV back to binary
    const keyBuffer = Buffer.from(atob(base64Key), 'binary');
    const ivBuffer = Buffer.from(atob(base64Iv), 'binary');

    // Log the decoded buffers for verification
    console.log("IV Buffer:", ivBuffer);
    console.log("Key Buffer:", keyBuffer);

    // Create a decipher using AES-256-GCM
    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer);

    // Decrypt the data
    let decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    
    return decrypted;
};

// Example route to decrypt file
submitFile.route("/file/decrypt/:filename")
    .get(async (req, res) => {
        try {
            const filename = req.params.filename;

            // Retrieve the file data from the database
            const fileData = await FileData.findOne({ filename });

            console.log(fileData);
            

            if (!fileData) {
                return res.status(404).json({ message: "File not found." });
            }

            // Extract Base64 key and IV from the database
            const { key, iv } = fileData;

            // Read the encrypted file from the file system
            const encryptedFilePath = `./uploads/${filename}`;
            const encryptedBuffer = fs.readFileSync(encryptedFilePath);

            // Decrypt the file using the Base64 key and IV
            const decryptedData = decrypt(encryptedBuffer, key, iv);

            // Save the decrypted file or send it in the response
            const decryptedFilePath = `./decrypt/${filename}`;
            fs.writeFileSync(decryptedFilePath, decryptedData);

            // Download the decrypted file
            return res.download(decryptedFilePath, (err) => {
                if (err) {
                    console.error(err);
                }
                // Optionally delete the file after sending
                fs.unlinkSync(decryptedFilePath);
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server Error. Please try again." });
        }
    });


module.exports = submitFile;