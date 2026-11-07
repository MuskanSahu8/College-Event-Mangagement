
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ApiClient from "../apiClient/Interceptor";
import "../style/Org.css";
import "../style/org-orange-theme.css";

const OrgDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Committee-wise event expansion
  const [expandedCommittees, setExpandedCommittees] = useState({});

  // Registration states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  // Committee states
  const [committees, setCommittees] = useState([]);
  const [committeeName, setCommitteeName] = useState("");
  const [committeeDescription, setCommitteeDescription] = useState("");
  const [committeeLoading, setCommitteeLoading] = useState(false);
  const [committeeMessage, setCommitteeMessage] = useState("");

  // Fetch committees
  const getCommittees = async () => {
    try {
      const response = await ApiClient.get("/committee/");
      setCommittees(response.data.committees || []);
    } catch (err) {
      console.error("Get committees error:", err);
      setCommitteeMessage("Unable to load committees.");
    }
  };

  // Fetch events and committees
  useEffect(() => {
    const getEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await ApiClient.get("/event/get");
        const data = response.data;

        const eventList = Array.isArray(data)
          ? data
          : data.events || data.data || [];

        setEvents(Array.isArray(eventList) ? eventList : []);
      } catch (err) {
        console.error("Get events error:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load your events."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      getEvents();
      getCommittees();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Fetch registrations for a selected event
  const getRegistrations = async (event) => {
    setSelectedEvent(event);
    setRegistrations([]);
    setRegistrationError("");
    setRegistrationLoading(true);

    try {
      const response = await ApiClient.get(
        `/register/event/${event._id}/registrations`
      );

      setRegistrations(response.data.registrations || []);
    } catch (err) {
      console.error("Get registrations error:", err);
      setRegistrationError(
        err.response?.data?.message ||
          "Unable to load registrations."
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Close registrations
  const closeRegistrations = () => {
    setSelectedEvent(null);
    setRegistrations([]);
    setRegistrationError("");
  };

  // Create committee
  const handleCreateCommittee = async (e) => {
    e.preventDefault();

    if (!committeeName.trim() || !committeeDescription.trim()) {
      setCommitteeMessage(
        "Please enter the committee name and description."
      );
      return;
    }

    setCommitteeLoading(true);
    setCommitteeMessage("");

    try {
      const response = await ApiClient.post("/committee/create", {
        name: committeeName.trim(),
        description: committeeDescription.trim(),
      });

      setCommitteeMessage(
        response.data.message ||
          "Committee created successfully!"
      );

      setCommitteeName("");
      setCommitteeDescription("");

      await getCommittees();
    } catch (err) {
      setCommitteeMessage(
        err.response?.data?.message ||
          "Unable to create committee."
      );
    } finally {
      setCommitteeLoading(false);
    }
  };

  // Toggle events for an individual committee
  const toggleCommittee = (committeeName) => {
    setExpandedCommittees((previous) => ({
      ...previous,
      [committeeName]: !previous[committeeName],
    }));
  };

  // Format event date
  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate event statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((event) => {
    if (!event.eventdate) return false;

    const eventDate = new Date(event.eventdate);

    if (Number.isNaN(eventDate.getTime())) return false;

    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const pastEvents = events.filter((event) => {
    if (!event.eventdate) return false;

    const eventDate = new Date(event.eventdate);

    if (Number.isNaN(eventDate.getTime())) return false;

    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  const totalRegistrations = events.reduce(
    (total, event) =>
      total + (Number(event.registrationCount) || 0),
    0
  );

  // Group events by committee
  const groupedEvents = events.reduce((groups, event) => {
    const committeeName =
      event.committee?.name || "Other Events";

    if (!groups[committeeName]) {
      groups[committeeName] = [];
    }

    groups[committeeName].push(event);
    return groups;
  }, {});

  if (!user) {
    return (
      <div className="org-loading">
        Loading organizer details...
      </div>
    );
  }

  return (
    <div className="org-dashboard">
      {/* Welcome Section */}
      <div className="org-welcome">
        <div className="org-welcome-content">
          <span className="org-welcome-label">
            ORGANIZER DASHBOARD
          </span>

          <h1>Welcome back, {user.name}!</h1>

          <p>
            Manage your college events, track registrations
            and stay organized.
          </p>
        </div>

        <button
          type="button"
          className="org-create-btn"
          onClick={() => navigate("/create")}
        >
          <span>＋</span> Create Event
        </button>
      </div>

      {/* Statistics */}
      <div className="org-stats">
        <div className="org-stat-card">
          <div className="org-stat-icon purple">▣</div>
          <div>
            <p>Total Events</p>
            <h2>{events.length}</h2>
          </div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon purple">👥</div>
          <div>
            <p>Total Registrations</p>
            <h2>{totalRegistrations}</h2>
          </div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon green">◷</div>
          <div>
            <p>Upcoming Events</p>
            <h2>{upcomingEvents.length}</h2>
          </div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon orange">✓</div>
          <div>
            <p>Past Events</p>
            <h2>{pastEvents.length}</h2>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="org-main-grid">
        {/* Events Section */}
        <div className="org-events-section">
          <div className="org-section-header">
            <div>
              <h2>My Events</h2>
              <p>Events organized by committee</p>
            </div>

            <button
              type="button"
              className="org-view-all"
              onClick={() => navigate("/my-events")}
            >
              View All →
            </button>
          </div>

          {loading && (
            <div className="org-empty-state">
              Loading events...
            </div>
          )}

          {!loading && error && (
            <div className="org-error">
              {error}
              <button
                type="button"
                className="org-details-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="org-empty-state">
              <div className="org-empty-icon">▣</div>
              <h3>No events yet</h3>
              <p>
                Create your first event and start engaging students.
              </p>

              <button
                type="button"
                className="org-create-btn"
                onClick={() => navigate("/create")}
              >
                + Create Event
              </button>
            </div>
          )}

          {/* Committee-wise Event Groups */}
          {!loading && !error && events.length > 0 && (
            <div className="my-events-committee-groups">
              {Object.entries(groupedEvents).map(
                ([committeeName, committeeEvents]) => {
                  const isExpanded =
                    Boolean(expandedCommittees[committeeName]);

                  const visibleEvents = isExpanded
                    ? committeeEvents
                    : committeeEvents.slice(0, 3);

                  return (
                    <section
                      className="my-events-committee-group"
                      key={committeeName}
                    >
                      {/* Committee Heading */}
                      <div className="my-events-committee-heading">
                        <div>
                          <h2>{committeeName}</h2>
                          <p>
                            {committeeEvents.length}{" "}
                            {committeeEvents.length === 1
                              ? "event"
                              : "events"}
                          </p>
                        </div>
                      </div>

                      {/* Compact Event Cards */}
                      <div className="my-events-grid">
                        {visibleEvents.map((event) => (
                          <article
                            className="my-event-card"
                            key={event._id}
                          >
                            {/* Event Image */}
                            <div className="my-event-image-wrapper">
                              {event.image ? (
                                <img
                                  src={event.image}
                                  alt={event.eventName || "Event"}
                                  className="my-event-image"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display =
                                      "none";

                                    const placeholder =
                                      e.currentTarget
                                        .nextElementSibling;

                                    if (placeholder) {
                                      placeholder.style.display =
                                        "flex";
                                    }
                                  }}
                                />
                              ) : null}

                              <div
                                className="my-event-placeholder"
                                style={{
                                  display: event.image
                                    ? "none"
                                    : "flex",
                                }}
                              >
                                <span>🎉</span>
                                <p>Event Image</p>
                              </div>
                            </div>

                            {/* Essential Event Details */}
                            <div className="my-event-content">
                              <h3>
                                {event.eventName ||
                                  "Untitled Event"}
                              </h3>

                              <div className="my-event-quick-info">
                                <span>
                                  📅 {formatDate(event.eventdate)}
                                </span>

                                {event.venue && (
                                  <span>📍 {event.venue}</span>
                                )}
                              </div>

                              {/* Event Actions */}
                              <div className="org-event-buttons">
                                <button
                                  type="button"
                                  className="org-details-btn"
                                  onClick={() =>
                                    navigate(`/event/${event._id}`)
                                  }
                                >
                                  View Details
                                </button>

                                <button
                                  type="button"
                                  className="org-registration-btn"
                                  onClick={() =>
                                    getRegistrations(event)
                                  }
                                >
                                  Registrations
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>

                      {/* View All / Show Less */}
                      {committeeEvents.length > 3 && (
                        <button
                          type="button"
                          className="committee-toggle-btn"
                          onClick={() =>
                            toggleCommittee(committeeName)
                          }
                        >
                          {isExpanded
                            ? "Show Less ↑"
                            : `View All ${committeeEvents.length} Events ↓`}
                        </button>
                      )}
                    </section>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Organizer Profile */}
        <div className="org-profile-card">
          <div className="org-profile-top">
            <div className="org-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <h2>{user.name}</h2>
            <span className="org-role-badge">Organizer</span>
          </div>

          <div className="org-profile-details">
            <div>
              <span>Full Name</span>
              <strong>{user.name}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{user.email}</strong>
            </div>

            <div>
              <span>Account Role</span>
              <strong>{user.role}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Student Registrations */}
      {selectedEvent && (
        <div className="org-registrations-section">
          <div className="org-section-header">
            <div>
              <h2>Student Registrations</h2>
              <p>{selectedEvent.eventName}</p>
            </div>

            <button
              type="button"
              className="org-close-btn"
              onClick={closeRegistrations}
            >
              ✕ Close
            </button>
          </div>

          {registrationLoading && (
            <div className="org-empty-state">
              Loading registrations...
            </div>
          )}

          {!registrationLoading && registrationError && (
            <div className="org-error">
              {registrationError}
            </div>
          )}

          {!registrationLoading &&
            !registrationError &&
            registrations.length === 0 && (
              <div className="org-empty-state">
                <h3>No registrations yet</h3>
                <p>
                  Students who register for this event will appear here.
                </p>
              </div>
            )}

          {!registrationLoading &&
            !registrationError &&
            registrations.length > 0 && (
              <>
                <div className="org-registration-count">
                  Total Registrations:{" "}
                  <strong>{registrations.length}</strong>
                </div>

                <div className="org-table-container">
                  <table className="org-registration-table">
                    <thead>
                      <tr>
                        <th>Name</th>
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
                          <td>{student.name}</td>
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
              </>
            )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="org-actions-section">
        <div className="org-section-header">
          <div>
            <h2>Quick Actions</h2>
            <p>Manage your event activities</p>
          </div>
        </div>

        <div className="org-actions">
          <div className="org-action-card">
            <div className="org-action-icon">＋</div>
            <h3>Create New Event</h3>
            <p>
              Publish a new college event for students.
            </p>
            <button
              type="button"
              onClick={() => navigate("/create")}
            >
              Create Event →
            </button>
          </div>

          <div className="org-action-card">
            <div className="org-action-icon">▣</div>
            <h3>Manage Events</h3>
            <p>
              Update event details, images and information.
            </p>
            <button
              type="button"
              onClick={() => navigate("/my-events")}
            >
              Manage Events →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;
