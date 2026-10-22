JavaScript 
import React, { useState } from 'react'; 
import axios from 'axios'; 
 
const PaymentUpload = ({ eventId, amount }) => { 
  const [slip, setSlip] = useState(null); 
 
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    if (!slip) return alert('Please select a payment slip image'); 
 
    const formData = new FormData(); 
    formData.append('eventId', eventId); 
    formData.append('amount', amount); 
    formData.append('slip', slip); 
 
    try { 
      const token = localStorage.getItem('token'); 
      await axios.post('h p://localhost:5000/api/payments/upload', formData, { 
        headers: {  
          'Authoriza on': `Bearer ${token}`, 
          'Content-Type': 'mul part/form-data' 
        } 
      }); 
      alert('Payment slip uploaded successfully!'); 
    } catch (err) { 
      alert(err.response?.data?.message || 'Upload failed'); 
    } 
  }; 
 
  return ( 
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-md mx
auto mt-6"> 
      <h3 className="text-xl font-bold mb-4 text-blue-600">Upload Payment Slip</h3> 
      <p className="text-sm text-gray-600 mb-4">Amount to Pay: LKR {amount}</p> 
      <input  
        type="file"  
        onChange={(e) => setSlip(e.target.files[0])}  
        className="w-full p-2 border rounded mb-4"  
        accept="image/*"  
        required  
/> 
<bu on type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue
700"> 
Submit Payment 
</bu on> 
</form> 
); 
}; 
export default PaymentUpload;