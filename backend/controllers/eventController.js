JavaScript
const Event = require('../models/Event');
exports.createEvent = async (req, res) => {
 try {
 const { Ɵtle, descripƟon, category, date, venue, ƟcketLimit } = req.body;
 const bannerPath = req.file ? req.file.path : '';
 const newEvent = new Event({
 Ɵtle,
 descripƟon,
 category,
 date,
 venue,
 banner: bannerPath,
 ƟcketLimit: Number(ƟcketLimit),
 availableTickets: Number(ƟcketLimit),
 createdBy: req.user ? req.user.id : null
 });
 const savedEvent = await newEvent.save();
 res.status(201).json({ message: 'Event created successfully!', event: savedEvent });
 } catch (error) {
 res.status(500).json({ message: 'Error creaƟng event', error: error.message });
 }
};
exports.getAllEvents = async (req, res) => {
 try {
 const { category, search } = req.query;
 let query = {};
 if (category) query.category = category;
 if (search) query.Ɵtle = { $regex: search, $opƟons: 'i' };
 const events = await Event.find(query).sort({ date: 1 });
 res.status(200).json(events);
 } catch (error) {
 res.status(500).json({ message: 'Error fetching events', error: error.message });
 }
};
exports.getEventById = async (req, res) => {
 try {
 const event = await Event.findById(req.params.id);
 if (!event) return res.status(404).json({ message: 'Event not found' });
 res.status(200).json(event);
 } catch (error) {
 res.status(500).json({ message: 'Error fetching event', error: error.message });
 }
};
exports.updateEvent = async (req, res) => {
 try {
 const updateData = { ...req.body };
 if (req.file) updateData.banner = req.file.path;
 const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
 if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
 res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
 } catch (error) {
 res.status(500).json({ message: 'Error updaƟng event', error: error.message });
 }
};
exports.deleteEvent = async (req, res) => {
 try {
 const deletedEvent = await Event.findByIdAndDelete(req.params.id);
 if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
 res.status(200).json({ message: 'Event deleted successfully' });
 } catch (error) {
 res.status(500).json({ message: 'Error deleƟng event', error: error.message });
 }
}; 
