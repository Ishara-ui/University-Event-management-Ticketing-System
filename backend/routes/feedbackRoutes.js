const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, (req, res) => {
  res.status(201).json({ message: 'Feedback submitted successfully.' });
});

module.exports = router;