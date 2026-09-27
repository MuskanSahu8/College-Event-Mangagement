import React, { useState } from 'react'
import ApiClient from '../apiClient/Interceptor.js';
import {useNavigate} from "react-router-dom";

const Signin = () => {
    const  navigate=useNavigate();
    const [formData,setFormData]=useState({
        email:"",
        password:""
    })
    const [loading,setLoading]=useState(false);
    const handleChange =(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }
    const handleSubmit=async(e)=>{
        e.preventDefault();
        //fetch
        const {email,password}=formData;
        //validate
        if(!email ||!password){
            alert("all fields are req");
            return;
        }
        try{
            setLoading(true);
            const response=await ApiClient.post("/user/signin",formData);
            console.log(response.data);
            console.log("sucess")
            alert("signin successful");
            navigate("/");

        }catch(error){
         console.log("signin failure");
        console.log(error.response?.data || error.message);
        }
    }
  return (
    <div className='auth-container'>
        <h1>Signin</h1>
        <form  className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor='email'>Email</label>
            <input type='email' name='email' placeholder='enter email' value={formData.email} onChange={handleChange}/>
             <label htmlFor='password'>Password</label>
            <input type='password' name='password' placeholder='enter password' value={formData.password} onChange={handleChange}/>
            <button type='submit'>Signin</button>
            
               </form>
      
    </div>
  )
}

export default Signin
