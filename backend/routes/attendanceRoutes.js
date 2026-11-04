const express = require('express');
const router = express.Router();
const { protect, authorizeRoles, EVENT_MANAGER_ROLES } = require('../middleware/authMiddleware');
const { getAttendance, checkIn } = require('../controllers/attendanceController');
const eventManagers = authorizeRoles(...EVENT_MANAGER_ROLES);

router.get('/event/:eventId', protect, eventManagers, getAttendance);
router.post('/check-in', protect, eventManagers, checkIn);

module.exports = router;