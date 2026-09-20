import React, { useState } from 'react'
import ApiClient from '../apiClient/Interceptor';

const Signin = () => {
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
            console.log("signin successful");

        }catch(error){
         console.log("signin failure");
        console.log(error.response?.data || error.message);
        }
    }
  return (
    <div className='auth-container'>
        <form onSubmit={handleSubmit}>
            <label htmlFor='email'>Email</label>
            <input type='email' name='email' placeholder='enter email' value={FormData.email} onChange={handleChange}/>
             <label htmlFor='password'>Password</label>
            <input type='password' name='password' placeholder='enter password' value={FormData.password} onChange={handleChange}/>
            <button type='submit'>Signin</button>
               </form>
      
    </div>
  )
}

export default Signin
