JavaScript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const ManageEvents = () => {
 const [events, setEvents] = useState([]);
 useEffect(() => {
 fetchEvents();
 }, []);
 const fetchEvents = async () => {
 const res = await axios.get('hƩp://localhost:5000/api/events');
 setEvents(res.data);
 };
 const handleDelete = async (id) => {
 if (window.confirm('Are you sure you want to delete this event?')) {
 await axios.delete(`hƩp://localhost:5000/api/events/${id}`);
 fetchEvents();
 }
 };
 return (
 <div className="max-w-5xl mx-auto p-6">
 <h2 className="text-2xl font-bold mb-6">Manage Events</h2>
 <table className="w-full border-collapse border border-gray-200">
 <thead>
 <tr className="bg-gray-100">
 <th className="border p-2">Title</th>
 <th className="border p-2">Category</th>
 <th className="border p-2">AcƟons</th>
 </tr>
 </thead>
 <tbody>
 {events.map((evt) => (
 <tr key={evt._id} className="text-center">
 <td className="border p-2">{evt.Ɵtle}</td>
 <td className="border p-2">{evt.category}</td>
 <td className="border p-2">
 <buƩon onClick={() => handleDelete(evt._id)} className="bg-red-500 text-white px-3 py-1
rounded">Delete</buƩon>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
};
export default ManageEvents;