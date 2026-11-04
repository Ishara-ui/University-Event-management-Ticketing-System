const OrganizerRequest = require('../models/OrganizerRequest');
const User = require('../models/User');

const createOrganizerRequest = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only student accounts can request organizer access.' });
    }

    const { requestedRole, faculty, justification } = req.body;
    if (!['Event Organizer', 'Faculty Lead'].includes(requestedRole)) {
      return res.status(400).json({ message: 'Choose Event Organizer or Faculty Lead.' });
    }
    if (!String(faculty || '').trim() || String(justification || '').trim().length < 20) {
      return res.status(400).json({ message: 'Faculty and a justification of at least 20 characters are required.' });
    }

    const existing = await OrganizerRequest.findOne({ userId: req.user.id, status: { $in: ['Pending', 'In Review'] } });
    if (existing) return res.status(409).json({ message: 'You already have an organizer request awaiting review.' });

    const request = await OrganizerRequest.create({
      userId: req.user.id,
      requestedRole,
      faculty: String(faculty).trim(),
      justification: String(justification).trim()
    });
    res.status(201).json({ message: 'Organizer access request submitted.', request });
  } catch (error) {
    res.status(500).json({ message: 'Could not submit organizer request.' });
  }
};

const getMyOrganizerRequest = async (req, res) => {
  try {
    const request = await OrganizerRequest.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Could not load organizer request.' });
  }
};

const getPendingOrganizerRequests = async (req, res) => {
  try {
    const requests = await OrganizerRequest.find({ status: 'Pending' })
      .populate('userId', 'name email faculty studentId')
      .sort({ createdAt: 1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Could not load pending organizer requests.' });
  }
};

const reviewOrganizerRequest = async (req, res) => {
  try {
    const { action, reviewNote = '' } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Choose approve or reject.' });
    }

    const request = await OrganizerRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending' },
      { $set: { status: 'In Review', reviewedBy: req.user.id, reviewNote: String(reviewNote).slice(0, 1000) } },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Pending organizer request not found.' });

    if (action === 'approve') {
      const user = await User.findByIdAndUpdate(request.userId, { role: request.requestedRole }, { new: true });
      if (!user) {
        await OrganizerRequest.updateOne({ _id: request._id }, { $set: { status: 'Pending', reviewedBy: null } });
        return res.status(404).json({ message: 'Requesting user no longer exists.' });
      }
    }

    request.status = action === 'approve' ? 'Approved' : 'Rejected';
    await request.save();
    res.status(200).json({ message: `Organizer request ${action}d.`, request });
  } catch (error) {
    res.status(500).json({ message: 'Could not review organizer request.' });
  }
};

module.exports = { createOrganizerRequest, getMyOrganizerRequest, getPendingOrganizerRequests, reviewOrganizerRequest };