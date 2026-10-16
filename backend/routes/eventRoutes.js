JavaScript
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const upload = require('../middleware/uploadMiddleware');
router.post('/', upload.single('banner'), eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', upload.single('banner'), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
module.exports = router; 
