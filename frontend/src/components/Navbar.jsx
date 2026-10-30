JavaScript 
import React from 'react'; 
import { Link } from 'react-router-dom';  

const Navbar = () => {   
              const token = localStorage.getItem('token');   
              const user = JSON.parse(localStorage.getItem('user') || '{}');    
              const handleLogout = () => {     
                            localStorage.removeItem('token');     
                            localStorage.removeItem('user');     
                            window.location.href = '/login';   
                            };    
                            
                            return (     
                            <nav className="bg-blue-600 text-white p-4 flex jus fy-between items-center shadow-md">       
                            <div className="text-xl font-bold">         
                                          <Link to="/">UniEvents</Link>       
                                          </div>       
                                          <div className="flex gap-4 items-center">         
                                                        <Link to="/" className="hover:underline">Home</Link>         
                                                        {token ? (           
                                                        <>             
                                                        <span className="bg-blue-700 px-3 py-1 rounded text-sm">{user.role}</span>             
                                                        <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red600">               
                                                                      Logout             
                                                                      </button>           
                                                         </>         
                                                        ) : (           
                                                        <> 
                                                         <Link to="/login" className="bg-white text-blue-600 px-3 py-1 rounded fontsemibold">Login</Link>             
                                                         <Link to="/register" className="bg-green-500 px-3 py-1 rounded">Register</Link>           
                                                         </>         
                                                         )}       
                                                         </div>     
                                                         </nav>   
                                                         ); 
                                                        };  
                                                        
export default Navbar; 