JavaScript 
const express = require('express'); 
const router = express.Router(); 
const { bookTicket, getUserTickets } = require('../controllers/bookingController'); 
const { protect } = require('../middleware/authMiddleware'); 
router.post('/', protect, bookTicket); 
router.get('/my-ckets', protect, getUserTickets); 
module.exports = router;