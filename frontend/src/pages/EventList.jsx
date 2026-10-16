JavaScript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
const EventList = () => {
 const [events, setEvents] = useState([]);
 const [search, setSearch] = useState('');
 const [category, setCategory] = useState('');
 useEffect(() => {
 fetchEvents();
 }, [search, category]);
 const fetchEvents = async () => {
 try {
 const res = await
axios.get(`hƩp://localhost:5000/api/events?search=${search}&category=${category}`);
 setEvents(res.data);
 } catch (err) {
 console.error(err);
 }
 };
 return (
 <div className="max-w-6xl mx-auto p-6">
 <div className="flex gap-4 mb-6">
 <input
 type="text"
 placeholder="Search events..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="p-2 border rounded w-1/2"
 />
 <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border
rounded w-1/2">
 <opƟon value="">All Categories</opƟon>
 <opƟon value="Workshop">Workshop</opƟon>
 <opƟon value="Sports">Sports</opƟon>
 <opƟon value="Cultural">Cultural</opƟon>
 <opƟon value="Academic">Academic</opƟon>
 </select>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {events.map((evt) => (
 <div key={evt._id} className="bg-white rounded-lg shadow border p-4">
 <h3 className="text-xl font-bold">{evt.Ɵtle}</h3>
 <p className="text-sm text-gray-500">{evt.category} | {evt.venue}</p>
 <p className="text-gray-600 mt-2">{evt.descripƟon.substring(0, 100)}...</p>
 <Link to={`/events/${evt._id}`} className="mt-4 inline-block bg-blue-600 text-white px-4 py-2
rounded">View Details</Link>
 </div>
 ))}
 </div>
 </div>
 );
};
export default EventList; 
