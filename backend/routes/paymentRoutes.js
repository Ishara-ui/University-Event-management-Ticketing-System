JavaScript 
const express = require('express'); 
const router = express.Router(); 
const { uploadPaymentSlip } = require('../controllers/paymentController'); 
const { protect } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware'); 
router.post('/upload', protect, upload.single('slip'), uploadPaymentSlip); 
module.exports = router;