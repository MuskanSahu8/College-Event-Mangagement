import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import "../style/MyRegistration.css";

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await ApiClient.get(
          "/register/my-registrations"
        );

        setRegistrations(response.data.registrations || []);
      } catch (error) {
        console.error(
          "Fetch registrations error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load registrations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="myreg-message">
        <div className="myreg-loader"></div>
        <p>Loading your registrations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myreg-message myreg-error">
        <h3>Unable to load registrations</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="my-registrations">
      <div className="myreg-hero">
        <div>
          <span className="myreg-tag">STUDENT PANEL</span>
          <h1>My Registrations</h1>
          <p>
            Keep track of all the events you have registered for.
          </p>
        </div>

        <div className="myreg-count">
          <span>{registrations.length}</span>
          <p>Total Registrations</p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="myreg-empty">
          <div className="myreg-empty-icon">📅</div>
          <h2>No Registrations Yet</h2>
          <p>
            You haven't registered for any events yet.
            Explore events and find something interesting!
          </p>
        </div>
      ) : (
        <div className="registration-list">
          {registrations.map((registration) => (
            <div
              className="registration-card"
              key={registration._id}
            >
              <div className="registration-card-header">
                <div>
                  <span className="registration-label">
                    EVENT REGISTRATION
                  </span>

                  <h2>
                    {registration.event?.eventName ||
                      "Event unavailable"}
                  </h2>
                </div>

                <span className="registration-status">
                  Registered
                </span>
              </div>

              <p className="registration-about">
                {registration.event?.about || "No description available"}
              </p>

              <div className="registration-details">
                <div className="registration-detail">
                  <span>📅</span>
                  <div>
                    <small>Event Date</small>
                    <strong>
                      {formatDate(registration.event?.eventdate)}
                    </strong>
                  </div>
                </div>

                <div className="registration-detail">
                  <span>🏢</span>
                  <div>
                    <small>Department</small>
                    <strong>
                      {registration.event?.dept || "N/A"}
                    </strong>
                  </div>
                </div>

                <div className="registration-detail">
                  <span>📝</span>
                  <div>
                    <small>Registered On</small>
                    <strong>
                      {formatDate(registration.createdAt)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;