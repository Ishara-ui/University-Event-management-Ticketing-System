JavaScript 
const express = require('express'); 
const router = express.Router(); 
const { scanQRCode, getEventAttendance } = require('../controllers/a endanceController'); 
const { protect, authorize } = require('../middleware/authMiddleware'); 
 
router.post('/scan', protect, authorize('Club Admin', 'Super Admin'), scanQRCode); 
router.get('/event/:eventId', protect, authorize('Club Admin', 'Super Admin'), getEventAttendance); 
module.exports = router;