const ContactInquiry = require('../models/ContactInquiry');

const subjects = [
  'Ticket & QR Code Issue',
  'Event Registration Question',
  'Organizer Account Request',
  'Technical Bug Report'
];

const submitInquiry = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const subject = String(req.body.subject || '');
    const message = String(req.body.message || '').trim();

    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ message: 'Enter a name between 2 and 120 characters.' });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (!subjects.includes(subject)) {
      return res.status(400).json({ message: 'Choose a valid inquiry subject.' });
    }
    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ message: 'Your message must be between 10 and 5000 characters.' });
    }

    const inquiry = await ContactInquiry.create({ name, email, subject, message });
    res.status(201).json({
      message: 'Your inquiry has been recorded. The support team can follow up using your email address.',
      reference: inquiry._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not submit your inquiry. Please try again or email support@unieventx.edu.' });
  }
};

module.exports = { submitInquiry };