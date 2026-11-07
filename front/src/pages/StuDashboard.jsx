
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../apiClient/Interceptor";
import { useAuth } from "../context/AuthContext";
import "../style/stuDashboard.css";

const StuDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommittee, setSelectedCommittee] = useState("All");
  const [expandedCommittees, setExpandedCommittees] = useState({});

  // Fetch dashboard data
  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const [eventRes, registrationRes, feedbackRes] =
          await Promise.all([
            ApiClient.get("/event/get"),
            ApiClient.get("/register/my-registrations"),
            ApiClient.get("/feedback/my-feedback"),
          ]);

        const eventData = eventRes.data;

        setEvents(
          Array.isArray(eventData)
            ? eventData
            : eventData.events || eventData.data || []
        );

        setRegistrations(
          registrationRes.data.registrations || []
        );

        setFeedbacks(
          feedbackRes.data.feedback || []
        );
      } catch (error) {
        console.error(
          "Dashboard error:",
          error.response?.data?.message || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  // Safely format event dates
  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((event) => {
      if (!event.eventdate) return false;

      const eventDate = new Date(event.eventdate);

      if (Number.isNaN(eventDate.getTime())) return false;

      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.eventdate) - new Date(b.eventdate)
    );

  // Get IDs of events already registered by this student
  const registeredEventIds = registrations
    .map((registration) => {
      if (
        registration.event &&
        typeof registration.event === "object"
      ) {
        return registration.event._id;
      }

      return registration.event;
    })
    .filter(Boolean)
    .map(String);

  // Get unique committee names
  const committeeNames = [
    ...new Set(
      upcomingEvents
        .map((event) =>
          typeof event.committee === "object"
            ? event.committee?.name
            : null
        )
        .filter(Boolean)
    ),
  ];

  // Filter events by selected committee
  const filteredEvents =
    selectedCommittee === "All"
      ? upcomingEvents
      : upcomingEvents.filter(
          (event) =>
            typeof event.committee === "object" &&
            event.committee?.name === selectedCommittee
        );

  // Group events by committee
  const groupedEvents = filteredEvents.reduce(
    (groups, event) => {
      const committeeName =
        typeof event.committee === "object"
          ? event.committee?.name
          : null;

      const groupName = committeeName || "Other Events";

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(event);
      return groups;
    },
    {}
  );

  // Expand or collapse one committee
  const toggleCommittee = (committeeName) => {
    setExpandedCommittees((previous) => ({
      ...previous,
      [committeeName]: !previous[committeeName],
    }));
  };

  if (loading) {
    return (
      <div className="student-loading">
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* WELCOME SECTION */}
      <div className="student-welcome">
        <div>
          <span className="welcome-tag">STUDENT PORTAL</span>

          <h1>
            Welcome back, {user?.name || "Student"}! 👋
          </h1>

          <p>
            Discover events, manage your registrations
            and share your experience.
          </p>
        </div>

        <div className="welcome-icon">🎓</div>
      </div>

      {/* STUDENT DETAILS */}
      <div className="student-profile-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || "S"}
        </div>

        <div className="profile-information">
          <h2>{user?.name || "Student"}</h2>
          <p>{user?.email || "Email not available"}</p>

          <span className="student-role">
            {user?.role || "Student"}
          </span>
        </div>

        <div className="profile-extra">
          <span>My Registrations</span>
          <strong>{registrations.length}</strong>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="student-stats">
        <div className="student-stat-card purple-card">
          <div className="stat-icon">📅</div>

          <div>
            <p>Available Events</p>
            <h2>{events.length}</h2>

            <button onClick={() => navigate("/events")}>
              Explore Events →
            </button>
          </div>
        </div>

        <div className="student-stat-card blue-card">
          <div className="stat-icon">📝</div>

          <div>
            <p>My Registrations</p>
            <h2>{registrations.length}</h2>

            <button
              onClick={() => navigate("/my-registrations")}
            >
              View Registrations →
            </button>
          </div>
        </div>

        <div className="student-stat-card pink-card">
          <div className="stat-icon">⭐</div>

          <div>
            <p>My Feedback</p>
            <h2>{feedbacks.length}</h2>

            <button onClick={() => navigate("/my-feedback")}>
              View Feedback →
            </button>
          </div>
        </div>
      </div>

      {/* UPCOMING EVENTS */}
      <div className="upcoming-events-section">
        <div className="section-heading">
          <div>
            <h2>Upcoming Events</h2>
            <p>
              Discover events happening at your college.
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() => navigate("/events")}
          >
            View All Events →
          </button>
        </div>

        {/* COMMITTEE FILTER */}
        <div className="committee-filter">
          <label htmlFor="committeeFilter">
            Filter by Committee:
          </label>

          <select
            id="committeeFilter"
            value={selectedCommittee}
            onChange={(e) =>
              setSelectedCommittee(e.target.value)
            }
          >
            <option value="All">All Committees</option>

            {committeeNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* EVENT LIST */}
        {filteredEvents.length === 0 ? (
          <div className="no-upcoming-events">
            <p>
              {selectedCommittee === "All"
                ? "No upcoming events available."
                : `No upcoming events found for ${selectedCommittee}.`}
            </p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(
            ([committeeName, committeeEvents]) => {
              const isExpanded =
                Boolean(expandedCommittees[committeeName]);

              const visibleEvents = isExpanded
                ? committeeEvents
                : committeeEvents.slice(0, 3);

              return (
                <div
                  className="committee-event-group"
                  key={committeeName}
                >
                  <div className="committee-heading-row">
                    <div>
                      <h3 className="committee-heading">
                        {committeeName}
                      </h3>

                      <p className="committee-event-count">
                        {committeeEvents.length}{" "}
                        {committeeEvents.length === 1
                          ? "event"
                          : "events"}
                      </p>
                    </div>
                  </div>

                  <div className="upcoming-events-grid">
                    {visibleEvents.map((event) => {
                      const isRegistered =
                        registeredEventIds.includes(
                          String(event._id)
                        );

                      return (
                        <div
                          className="upcoming-event-card"
                          key={event._id}
                        >
                          <div className="upcoming-event-image-wrapper">
                            {event.image ? (
                              <img
                                src={event.image}
                                alt={event.eventName || "Event"}
                                className="upcoming-event-image"
                              />
                            ) : (
                              <div className="event-image-placeholder">
                                🎉
                              </div>
                            )}
                          </div>

                          <div className="upcoming-event-content">
                            <h4>{event.eventName}</h4>

                            <p className="upcoming-event-about">
                              {event.about || "No description available."}
                            </p>

                            <div className="upcoming-event-meta">
                              <span>
                                <strong>Department:</strong>{" "}
                                {event.dept || "General"}
                              </span>

                              <span>
                                <strong>Date:</strong>{" "}
                                {formatDate(event.eventdate)}
                              </span>

                              {event.venue && (
                                <span>
                                  <strong>Venue:</strong>{" "}
                                  {event.venue}
                                </span>
                              )}
                            </div>

                            <div className="upcoming-event-actions">
                              {isRegistered ? (
                                <>
                                  <button
                                    className="registered-btn"
                                    disabled
                                  >
                                    ✓ Registered
                                  </button>

                                  <button
                                    className="event-view-btn"
                                    onClick={() =>
                                      navigate(`/event/${event._id}`)
                                    }
                                  >
                                    View Details →
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="event-view-btn"
                                  onClick={() =>
                                    navigate(`/event/${event._id}`)
                                  }
                                >
                                  Register / View Event →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* VIEW ALL / SHOW LESS */}
                  {committeeEvents.length > 3 && (
                    <button
                      className="committee-toggle-btn"
                      onClick={() => toggleCommittee(committeeName)}
                    >
                      {isExpanded
                        ? "Show Less ↑"
                        : `View All ${committeeEvents.length} Events →`}
                    </button>
                  )}
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
};

export default StuDashboard;
