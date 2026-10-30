JavaScript 
import React, { useState } from 'react'; 
import axios from 'axios'; 
 
const QRScanner = () => { 
  const [ cketId, setTicketId] = useState(''); 
  const [scanResult, setScanResult] = useState(null); 
 
  const handleManualScan = async (e) => { 
    e.preventDefault(); 
    try { 
      const token = localStorage.getItem('token'); 
      const res = await axios.post( 
        'h p://localhost:5000/api/a endance/scan', 
        { cketId }, 
        { headers: { Authorization: `Bearer ${token}` } } 
      ); 
      setScanResult(res.data. cket); 
      alert('A endance Marked Successfully!'); 
    } catch (err) { 
      alert(err.response?.data?.message || 'Scanning failed'); 
    } 
  }; 
 
  return ( 
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow"> 
      <h2 className="text-2xl font-bold mb-6 text-blue-600 text-center">Event A endance 
Scanner</h2>
   <form onSubmit={handleManualScan} className="space-y-4"> 
        <div> 
          <label className="block text-gray-700 text-sm font-bold mb-2">Enter/Scan Ticket ID</label> 
          <input  
            type="text"  
            value={ cketId}  
            onChange={(e) => setTicketId(e.target.value)}  
            placeholder="Paste or type cket ID here"  
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"  
            required  
          /> 
        </div> 
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue
700 font-bold"> 
          Verify & Mark A endance 
        </button> 
      </form> 
 
      {scanResult && ( 
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded"> 
          <h3 className="font-bold text-green-700 mb-2">Checked-In Details:</h3> 
          <p className="text-sm">User: {scanResult.userId?.name}</p> 
          <p className="text-sm">Status: {scanResult.status}</p> 
        </div> 
      )} 
    </div> 
  ); 
}; 
 
export default QRScanner;