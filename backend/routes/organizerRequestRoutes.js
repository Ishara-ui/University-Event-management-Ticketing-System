const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createOrganizerRequest,
  getMyOrganizerRequest,
  getPendingOrganizerRequests,
  reviewOrganizerRequest
} = require('../controllers/organizerRequestController');

router.post('/', protect, createOrganizerRequest);
router.get('/mine', protect, getMyOrganizerRequest);
router.get('/pending', protect, authorizeRoles('Admin', 'Super Admin'), getPendingOrganizerRequests);
router.patch('/:id/review', protect, authorizeRoles('Admin', 'Super Admin'), reviewOrganizerRequest);

module.exports = router;