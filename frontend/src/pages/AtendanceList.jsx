JavaScript 
import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
 
const AttendanceList = ({ eventId }) => { 
  const [attendanceData, setAttendanceData] = useState({ totalCheckedIn: 0, attendees: [] }); 
 
  useEffect(() => { 
    const fetchAttendance = async () => { 
      try { 
        const token = localStorage.getItem('token'); 
        const res = await axios.get(`h p://localhost:5000/api/a endance/event/${eventId}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }); 
        setAttendanceData(res.data); 
      } catch (err) { 
        console.error(err); 
      } 
    }; 
    if (eventId) fetchAttendance(); 
  }, [eventId]); 
 
  const exportToCSV = () => { 
    let csvContent = "data:text/csv;charset=u-8,Name,Email,Faculty\n"; 
    attendanceData.attendees.forEach((item) => { 
      csvContent += `${item.userId?.name},${item.userId?.email},${item.userId?.faculty}\r\n`; 
    }); 
    const encodedUri = encodeURI(csvContent); 
    const link = document.createElement("a"); 
    link.setAttribute("href", encodedUri); 
      link.setAttribute("download", "a endance_list.csv"); 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link); 
  }; 
 
  return ( 
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-6"> 
      <div className="flex jus fy-between items-center mb-6"> 
        <h2 className="text-2xl font-bold text-blue-600">A endance List (Total: 
{attendanceData.totalCheckedIn})</h2> 
        <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded 
hover:bg-green-700 font-semibold"> 
          Export to CSV 
        </button> 
      </div> 
 
      <table className="w-full border-collapse border border-gray-200"> 
        <thead> 
          <tr className="bg-gray-100"> 
            <th className="border p-2">Name</th> 
            <th className="border p-2">Email</th> 
            <th className="border p-2">Faculty</th> 
          </tr> 
        </thead> 
        <tbody> 
          {attendanceData.attendees.map((a , index) => ( 
            <tr key={index} className="text-center"> 
              <td className="border p-2">{a .userId?.name}</td> 
              <td className="border p-2">{a .userId?.email}</td> 
              <td className="border p-2">{a .userId?.faculty}</td> 
            </tr>
            ))} 
</tbody> 
</table> 
</div> 
); 
}; 
export default AttendanceList;
