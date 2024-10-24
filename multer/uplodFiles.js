
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
    }
})

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["application/x-zip-compressed", "application/octet-stream", "application/zip", "application/octet-stream", "text/plain"];
    const allowedExtensions = [".zip", ".rar", ".tar", ".7z", ".enc", ".txt"];
    const fileExtension = path.extname(file.originalname);
    const isValidFileType = allowedFileTypes.includes(file.mimetype);
    const isValidFileExtension = allowedExtensions.includes(fileExtension);

    if (isValidFileType && isValidFileExtension) {
        cb(null, true);
    } else {
        cb(new Error("File type"));
    }
}

let fileUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 100 }
});

module.exports = {
    fileUpload
};