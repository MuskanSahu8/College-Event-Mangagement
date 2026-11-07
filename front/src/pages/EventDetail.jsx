
import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../style/EventDetail.css";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const [error, setError] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  const isOrganizer = user?.role === "organizer";

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await ApiClient.get(`/event/get/${id}`);
        setEvent(response.data.event);

        if (user?.role === "organizer") {
          setRegistrationLoading(true);
          setRegistrationError("");

          try {
            const registrationResponse = await ApiClient.get(
              `/register/event/${id}/registrations`
            );

            setRegistrations(
              registrationResponse.data.registrations || []
            );
          } catch (err) {
            console.log("Registration error:", err);
            setRegistrationError(
              err.response?.data?.message ||
              "Unable to load registrations."
            );
          } finally {
            setRegistrationLoading(false);
          }
        }
      } catch (err) {
        console.log("Event details error:", err);
        setError(
          err.response?.data?.message ||
          "Unable to load event details."
        );
      } finally {
        setLoading(false);
      }
    };

    getEventDetails();
  }, [id, user]);

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="event-status">
        <div className="event-loader"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-status error-status">
        <h2>Unable to load event</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-status">
        <h2>Event not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div
  className={`event-detail-page ${
    isOrganizer ? "organizer-theme" : "student-theme"
  }`}
>

      {/* TOP HEADER */}
      <div className="event-detail-header">
        <div>
          <span className="event-header-tag">EVENT DETAILS</span>
          <h1>Discover Your Next Experience</h1>
          <p>Explore event information and be part of something exciting.</p>
        </div>

        <button
          className="event-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>
      </div>

      {/* EVENT MAIN CARD */}
      <div className="event-main-card">

        {event.image ? (
          <div className="event-banner">
            <img
              src={event.image}
              alt={event.eventName}
              className="event-banner-image"
            />
            <div className="event-banner-overlay">
              <span className="event-banner-label">
                ✨ Featured Event
              </span>
              <h2>{event.eventName}</h2>
            </div>
          </div>
        ) : (
          <div className="event-banner event-no-image">
            <div className="event-placeholder">
              <span>🎉</span>
              <h2>{event.eventName}</h2>
              <p>Discover something exciting</p>
            </div>
          </div>
        )}

        <div className="event-main-content">

          <div className="event-title-row">
            <div>
              <span className="event-category">
                {event.dept || "General Event"}
              </span>
              <h2>{event.eventName}</h2>
            </div>

            <span className="event-status-label">
              Upcoming Event
            </span>
          </div>

          {/* ABOUT */}
          <div className="event-about-section">
            <h3>About This Event</h3>
            <p>{event.about || "No description available."}</p>
          </div>

          {/* EVENT INFORMATION */}
          <h3 className="event-info-heading">
            Event Information
          </h3>

          <div className="event-info-grid">

            <div className="event-info-card">
              <span className="event-info-icon">📅</span>
              <div>
                <p>Event Date</p>
                <h4>{formatDate(event.eventdate)}</h4>
              </div>
            </div>

            <div className="event-info-card">
              <span className="event-info-icon">⏳</span>
              <div>
                <p>Last Registration Date</p>
                <h4>{formatDate(event.lastDate)}</h4>
              </div>
            </div>

            <div className="event-info-card">
              <span className="event-info-icon">🏢</span>
              <div>
                <p>Department</p>
                <h4>{event.dept || "Not specified"}</h4>
              </div>
            </div>

            <div className="event-info-card">
              <span className="event-info-icon">👥</span>
              <div>
                <p>Participation</p>
                <h4>
                  {isOrganizer
                    ? `${registrations.length} Registrations`
                    : "Join the Event"}
                </h4>
              </div>
            </div>

          </div>

          {/* STUDENT ACTIONS */}
          {!isOrganizer && user?.role === "student" && (
            <div className="event-student-actions">
              <div>
                <h3>Interested in this event?</h3>
                <p>Register now and share your experience with us.</p>
              </div>

              <div className="event-action-buttons">
                <button
                  className="register-event-btn"
                  onClick={() => navigate(`/event/${id}/register`)}
                >
                  Register Now →
                </button>

                <button
                  className="feedback-event-btn"
                  onClick={() => navigate(`/event/${id}/feedback`)}
                >
                  ⭐ Give Feedback
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ORGANIZER REGISTRATIONS */}
      {isOrganizer && (
        <div className="organizer-registrations-section">

          <div className="registration-heading">
            <div>
              <span className="registration-tag">
                ORGANIZER PANEL
              </span>
              <h2>Event Registrations</h2>
              <p>Students registered for this event.</p>
            </div>

            <div className="registration-count-card">
              <span>👥</span>
              <div>
                <p>Total Students</p>
                <h2>{registrations.length}</h2>
              </div>
            </div>
          </div>

          {registrationLoading && (
            <div className="registration-message">
              Loading registrations...
            </div>
          )}

          {registrationError && (
            <div className="registration-message registration-error">
              {registrationError}
            </div>
          )}

          {!registrationLoading &&
            !registrationError &&
            registrations.length === 0 && (
              <div className="registration-empty">
                <span>📋</span>
                <h3>No Registrations Yet</h3>
                <p>Student registrations will appear here.</p>
              </div>
            )}

          {!registrationLoading &&
            !registrationError &&
            registrations.length > 0 && (
              <div className="registration-table-wrapper">
                <table className="event-registration-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Class</th>
                      <th>Roll Number</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrations.map((student) => (
                      <tr key={student._id}>
                        <td className="registration-student-name">
                          {student.name}
                        </td>
                        <td>{student.email}</td>
                        <td>{student.phone}</td>
                        <td>{student.dept}</td>
                        <td>{student.className}</td>
                        <td>{student.universityRollno}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

        </div>
      )}

    </div>
  );
};

export default EventDetail;
