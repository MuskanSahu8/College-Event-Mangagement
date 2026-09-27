import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate= useNavigate();
  const getEvent = async () => {
    try {
      setLoading(true);

      const response = await ApiClient.get("/event/get");

      console.log(response.data);
      setEvents(response.data.events);
    } catch (error) {
      console.error(
        "Error fetching events:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvent();
  }, []);

  return (
    <div>
      <h1>All Events</h1>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div>
          {events.map((event) => (
            <div key={event._id} onClick={()=> navigate(`/event/${event._id}`)}>
              <h2>Event Name: {event.eventName}</h2>
              <p>About : {event.about}</p>
              <p>event Date: {event.eventdate}</p>
              <p>Dept: {event.eligibilityDepartment}</p>
              

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;