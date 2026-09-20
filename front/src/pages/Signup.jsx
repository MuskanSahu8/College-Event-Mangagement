import React, { useState } from 'react'
import ApiClient from '../apiClient/Interceptor.js';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role:""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    //  fetch
    const { name, email, password ,role } = formData;
    // validate
    if (!name || !email || !password ||!role) {
      alert("all fields are req");
      return
    }
    //validate
    if(password<6){
      alert("password must be atleast 6 character")
      return;
    }

    try {
      setLoading(true);
      const response = await ApiClient.post("/user/signup", formData);
      console.log(response.data);
      console.log("F signup sucessfully");
    } catch (error) {
      console.log("signup failure");
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }

  }

  return (
    <div className='auth-container'>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="text">Name:</label>
        <input type="name" id="name" placeholder='enter name' name="name" value={formData.name} onChange={handleChange} />
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" placeholder='enter email' name="email" value={formData.email} onChange={handleChange} />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" placeholder='enter password' name="password" value={formData.password} onChange={handleChange} />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="role">Select role</option>
          <option value="student">Student</option>
          <option value="organizer">Organizer</option>
        </select>
        <button type='submit' disabled={loading}>
          Signup
        </button>
      </form>

    </div>
  )
}

export default Signup
