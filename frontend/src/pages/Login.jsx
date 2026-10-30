JavaScript 
import React, { useState } from 'react'; 
import axios from 'axios';  
const Login = () => {   
              const [email, setEmail] = useState('');   
              const [password, setPassword] = useState('');    
              const handleLogin = async (e) => {     
                            e.preventDefault();     
                            try {       
                                          const res = await axios.post('h p://localhost:5000/api/auth/login', { email, password });       
                                          localStorage.setItem('token', res.data.token);       
                                          localStorage.setItem('user', JSON.stringify(res.data.user));       
                                          alert('Login Successful!');       
                                          window.location.href = '/';     
                            } catch (err) {       
                                                        
                                                        alert(err.response?.data?.message || 'Login Failed');     
                                          }   
                            };    
                                                        return (     
                                                        <div className="flex justify-center items-center min-h-screen bg-gray-100">       
                                                        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">         
                                                                      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">User Login</h2>         
                                                                      <div className="mb-4">           
                                                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>           
                                                                                    <input              
                                                                                    type="email"    
                                                                                    value={email}              
                                                                                    onChange={(e) => setEmail(e.target.value)}              
                                                                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"              
                                                                                    required            
                                                                                    />         
                                                                                    </div>         
                                                                                    <div className="mb-6">           
                                                                                                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>           
                                                                                                  <input             
                                                                                                   type="password"             
                                                                                                    value={password}             
                                                                                                     onChange={(e) => setPassword(e.target.value)}              
                                                                                                     className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"              
                                                                                                     required            
                                                                                                     />         
                                                                                                     </div>         <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue700 font-bold">           
                                                                                                                Login         
                                                                                                                </button>       
                                                                                                                </form>     
                                                                                                                
                                                                                                     </div>   
                                                                                                     ); 
                                                                                                     };  
                                                                                                     
export default Login; 