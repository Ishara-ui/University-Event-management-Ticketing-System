JavaScript;
import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "h p://localhost:5000/api/dashboard/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">
        Admin Analytics Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 font-semibold">Total Events</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 font-semibold">Total Tickets Booked</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalTickets}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-gray-500 font-semibold">Total Users</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 font-semibold">Total Revenue (LKR)</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalRevenue}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
