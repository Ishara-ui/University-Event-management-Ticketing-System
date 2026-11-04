const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorizeRoles, EVENT_MANAGER_ROLES } = require('../middleware/authMiddleware');
const eventManagers = authorizeRoles(...EVENT_MANAGER_ROLES);

router.post('/', protect, eventManagers, upload.single('banner'), eventController.createEvent);
router.get('/manage', protect, eventManagers, eventController.getManagedEvents);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', protect, eventManagers, upload.single('banner'), eventController.updateEvent);
router.patch('/:id/cancel', protect, eventManagers, eventController.cancelEvent);
router.delete('/:id', protect, eventManagers, eventController.deleteEvent);

module.exports = router;
