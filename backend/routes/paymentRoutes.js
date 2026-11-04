const express = require('express');
const router = express.Router();
const { uploadPaymentSlip, getPendingPayments, reviewPayment } = require('../controllers/paymentController');
const { protect, authorizeRoles, FINANCE_ROLES } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/pending', protect, authorizeRoles(...FINANCE_ROLES), getPendingPayments);
router.patch('/:id/review', protect, authorizeRoles(...FINANCE_ROLES), reviewPayment);
router.post('/upload', protect, upload.single('slip'), uploadPaymentSlip);

module.exports = router;