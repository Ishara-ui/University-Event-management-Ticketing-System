A. Create Event Page (frontend/src/pages/CreateEvent.jsx)
JavaScript
import React, { useState } from 'react';
import axios from 'axios';
const CreateEvent = () => {
 const [formData, setFormData] = useState({
 Ɵtle: '',
 descripƟon: '',
 category: 'Workshop',
 date: '',
 venue: '',
 ƟcketLimit: ''
 });
 const [banner, setBanner] = useState(null);
 const handleChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };
 const handleFileChange = (e) => {
 setBanner(e.target.files[0]);
 };
 const handleSubmit = async (e) => {
 e.preventDefault();
 const data = new FormData();
 Object.keys(formData).forEach((key) => data.append(key, formData[key]));
 if (banner) data.append('banner', banner);
 try {
 await axios.post('hƩp://localhost:5000/api/events', data, {
 headers: { 'Content-Type': 'mulƟpart/form-data' }
 });
 alert('Event created successfully!');
 } catch (err) {
 alert('Failed to create event');
 }
 };
 return (
 <div className="max-w-2xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
 <h2 className="text-2xl font-bold mb-6 text-blue-600">Create New Event</h2>
 <form onSubmit={handleSubmit} className="space-y-4">
 <input type="text" name="Ɵtle" placeholder="Event Title" onChange={handleChange}
className="w-full p-2 border rounded" required />
 <textarea name="descripƟon" placeholder="DescripƟon" onChange={handleChange}
className="w-full p-2 border rounded" required />
 <select name="category" onChange={handleChange} className="w-full p-2 border rounded">
 <opƟon value="Workshop">Workshop</opƟon>
 <opƟon value="Sports">Sports</opƟon>
 <opƟon value="Cultural">Cultural</opƟon>
 <opƟon value="Academic">Academic</opƟon>
 </select>
 <input type="dateƟme-local" name="date" onChange={handleChange} className="w-full p-2
border rounded" required />
 <input type="text" name="venue" placeholder="Venue" onChange={handleChange}
className="w-full p-2 border rounded" required />
 <input type="number" name="ƟcketLimit" placeholder="Ticket Limit"
onChange={handleChange} className="w-full p-2 border rounded" required />
 <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded"
accept="image/*" />
 <buƩon type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue700">Create Event</buƩon>
 </form>
 </div>
 );
};
export default CreateEvent; 