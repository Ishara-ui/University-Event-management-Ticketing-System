
JavaScript 
import React, { useState } from 'react'; 
import axios from 'axios';  

const Register = () => {   
              const [formData, setFormData] = useState({     
                            
                            name: '',    
                             email: '',     
                             password: '',     
                             role: 'Student',     
                             faculty: ''   
                             });    
                             const handleChange = (e) => {     
                                          setFormData({ ...formData, [e.target.name]: e.target.value });   
                                          };    
                                          
                                          const handleRegister = async (e) => {     
                                                        e.preventDefault();     
                                                        try {       
                                                                      await axios.post('h p://localhost:5000/api/auth/register', formData);       
                                                                      alert('Registration Successful! Please Login.');       
                                                                      window.locaton.href = '/login';     
                                                                      } catch (err) {       
                                                                      alert(err.response?.data?.message || 'Registraton Failed');     
                                                                      }   
                                                                      };    
                                                                      return (     
                                                                      <div className="flex jus fy-center items-center min-h-screen bg-gray-100"> 
                                                                       <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">         
                                                                                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Register</h2>                  
                                                                                    
                                                                                    <div className="mb-4">           
                                                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>           
                                                                                    <input              
                                                                                    type="text" name="name" onChange={handleChange}              
                                                                                    className="w-full p-2 border rounded" required            
                                                                                    />         
                                                                                    </div>          
                                                                                    
                                                                                    <div className="mb-4">           
                                                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>           
                                                                                    <input              
                                                                                    type="email" name="email" onChange={handleChange}              
                                                                                    className="w-full p-2 border rounded" required            
                                                                                    />         
                                                                                    </div>          
                                                                                    
                                                                                    <div className="mb-4">           
                                                                                                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>           
                                                                                                  <input              
                                                                                                  type="password" name="password" onChange={handleChange}              
                                                                                                  className="w-full p-2 border rounded" required            
                                                                                                  />         
                                                                                                  </div>          
                                                                                                  
                                                                                                  <div className="mb-4">           
                                                                                                  <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>           
                                                                                                  <select name="role" onChange={handleChange} className="w-full p-2 border rounded">             
                                                                                                                <option value="Student">Student</option> 
                                                                                                                  <option value="Club Admin">Club Admin</option>             
                                                                                                                  <option value="Finance Officer">Finance Officer</option>             
                                                                                                                  <option value="Super Admin">Super Admin</option>           
                                                                                                                  </select>         
                                                                                                                  </div>          
                                                                                                                  
                                                                                                                  <div className="mb-6">           
                                                                                                                              <label className="block text-gray-700 text-sm font-bold mb-2">Faculty</label>           
                                                                                                                              <input              
                                                                                                                              type="text" name="faculty" onChange={handleChange}              
                                                                                                                              className="w-full p-2 border rounded" placeholder="e.g. Faculty of Technology"            
                                                                                                                              />         
                                                                                                                              </div>         
                                                                                                                              
                                                                                                                     <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green700 font-bold">           
                                                                                                                              Register         
                                                                                                                              </button>       
                                                                                                                              </form>     
                                                                                                                              </div>   
                                                                                                                              ); 
                                                                                                                };  
                                                                                                                
export default Register;   