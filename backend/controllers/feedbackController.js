JavaScript;
const Feedback = require("../models/Feedback");
exports.submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;
    const userId = req.user.id;
    const feedback = await Feedback.create({
      userId,
      eventId,
      rating,
      comment,
    });

    res
      .status(201)
      .json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const feedbacks = await Feedback.find({ eventId }).populate(
      "userId",
      "name",
    );
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
