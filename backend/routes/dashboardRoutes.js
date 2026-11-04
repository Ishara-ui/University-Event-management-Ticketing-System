const express = require('express');
const router = express.Router();
const { protect, authorizeRoles, EVENT_MANAGER_ROLES, FINANCE_ROLES } = require('../middleware/authMiddleware');
const { getStats, getPublicStats } = require('../controllers/dashboardController');

router.get('/public-stats', getPublicStats);
router.get('/stats', protect, authorizeRoles(...new Set([...EVENT_MANAGER_ROLES, ...FINANCE_ROLES])), getStats);

module.exports = router;