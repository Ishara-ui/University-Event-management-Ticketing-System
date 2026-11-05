const Feedback = require('../models/Feedback');
const Ticket = require('../models/Ticket');

const submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comments } = req.body;
    const ratingValue = Number(rating);
    const commentText = String(comments || '').trim();

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5.' });
    }
    if (commentText.length < 5 || commentText.length > 2000) {
      return res.status(400).json({ message: 'Comments must be between 5 and 2000 characters.' });
    }

    const hasTicket = await Ticket.exists({ userId: req.user.id, eventId });
    if (!hasTicket) {
      return res.status(403).json({ message: 'You can only leave feedback for events you have booked.' });
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      eventId,
      rating: ratingValue,
      comments: commentText
    });

    res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Could not submit feedback. Please try again.' });
  }
};

module.exports = { submitFeedback };
