import React, { useEffect, useState } from 'react'
import ApiClient from '../apiClient/Interceptor';
import { useNavigate, useParams } from 'react-router-dom';

const EventDetail = () => {
      const {id}=useParams();
     const [event,setEvent]=useState();
     const [loading,setLoading] =useState(false);
     const navigate= useNavigate();
     const getEventid = async()=>{
      try{
        setLoading(true);
        const response= await ApiClient.get(`/event/get/${id}`);
        console.log(response.data);
        setEvent(response.data.event);
      }catch(error){
        console.error(
        "Error fetching event details:",
        error.response?.data?.message || error.message
      );
      }finally{
        setLoading(false);
      }
     }

     useEffect(()=>{
       getEventid();
     },[id]);

     if(loading){
      return <h2>loading event...</h2>
     }

     if(!event){
      return <h2>event not found</h2>
     }

  return (
    <div className='event-detail'>
       <h1 className='event-name'>{event.eventName}</h1>
       <h3 className='data'>About: {event.about}</h3>
       <h3 className='data'>Event date: {event.eventdate}</h3>
       <h3 className="data"> Dept: {event.dept}</h3>
       <button onClick={()=> navigate(`/event/${id}/register`)}>Register</button>
       <button onClick={()=> navigate(`/event/${id}/feedback`)}>Feedback</button>
    </div>
  )
}

export default EventDetail
