JavaScript
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
 desƟnaƟon: (req, file, cb) => {
 cb(null, 'uploads/');
 },
 filename: (req, file, cb) => {
 cb(null, `${Date.now()}-${file.originalname}`);
 }
});
const fileFilter = (req, file, cb) => {
 const allowedTypes = /jpeg|jpg|png|webp/;
 const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
 const mimeType = allowedTypes.test(file.mimetype);
 if (extName && mimeType) return cb(null, true);
 cb(new Error('Only images are allowed!'));
};
const upload = multer({ storage, fileFilter });
module.exports = upload;