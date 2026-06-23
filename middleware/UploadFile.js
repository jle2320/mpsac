const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        // one folder per request
        if (!req.uploadTime) {
            req.uploadTime = Date.now();
        }

        const uploadDir = path.join(__dirname, '../public/uploads', String(req.uploadTime));

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '_' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

module.exports = upload;