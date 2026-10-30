JavaScript;
const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Payment = require("../models/Payment");

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const totalUsers = await User.countDocuments();

    const payments = await Payment.find({ status: "Approved" });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      totalEvents,
      totalTickets,
      totalUsers,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
