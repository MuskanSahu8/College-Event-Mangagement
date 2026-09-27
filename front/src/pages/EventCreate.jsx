
import React, { useState } from 'react'
import ApiClient from '../apiClient/Interceptor';

const EventCreate = () => {
     const [events,setEvents]=useState({
          eventName:"",
        about:"",
        eventdate:"",
        dept:""
     })
     const [loading,setLoading] =useState(false);

  const createEvent = async(e)=>{
    e.preventDefault();

    try{
      setLoading(true);
      const response= await ApiClient.post("/event/create",events);
      console.log(response.data);
      alert("event created success");
      setEvents({
         eventName:"",
        about:"",
        eventdate:"",
        dept:""
      })

    }catch(error){
        console.error("Error creating event:", error.response?.data?.message || error.message);
    }finally{
        setLoading(false);
    }
  } 
  const handleChange = (e)=>{
    // e.preventDefault();
    setEvents({
        ...events,
        [e.target.name]:e.target.value
    })
  }
  return (
   <div className='event-container'>
   {/* create,find ,update,delete */}
       <div className='createEvent'>
        <form onSubmit={createEvent}>
            <label htmlFor='eventName'>Event Name</label>
            <input type="text"name="eventName" value={events.eventName} placeholder='enter event name' onChange={handleChange}/>
             <label htmlFor='about'> About Event </label>
            <input type="text" name="about" value={events.about} placeholder='about event' onChange={handleChange}/>
             <label htmlFor='eventdate'>Event Date</label>
            <input type="date"name="eventdate" value={events.eventdate} placeholder='date' onChange={handleChange}/>
            <label htmlFor="dept">Enter department</label>
            <input type="dept" name="dept" value={events.dept} placeholder='dept' onChange={handleChange}></input>
            <button type='submit'>Create</button>
        </form>
       </div>
      
    </div>
  )
}

export default EventCreate
