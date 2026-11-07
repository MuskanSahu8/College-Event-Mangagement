
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../apiClient/Interceptor";
import "../style/Event.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Expand or collapse events separately for each committee
  const [expandedCommittees, setExpandedCommittees] = useState({});

  const navigate = useNavigate();

  // Fetch events
  const getEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await ApiClient.get("/event/get");
      const eventData = response.data;

      const eventList = Array.isArray(eventData)
        ? eventData
        : eventData.events || eventData.data || [];

      setEvents(Array.isArray(eventList) ? eventList : []);
    } catch (error) {
      console.error("Fetch events error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to fetch events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return "Date not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not specified";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Toggle individual committee sections
  const toggleCommittee = (committeeName) => {
    setExpandedCommittees((previous) => ({
      ...previous,
      [committeeName]: !previous[committeeName],
    }));
  };

  // Group events by committee
  const groupedEvents = events.reduce((groups, event) => {
    const committee =
      event.committee && typeof event.committee === "object"
        ? event.committee
        : null;

    const committeeName = committee?.name || "Other Events";

    const committeeDescription =
      committee?.description ||
      "Explore exciting college events and activities.";

    if (!groups[committeeName]) {
      groups[committeeName] = {
        description: committeeDescription,
        events: [],
      };
    }

    groups[committeeName].events.push(event);

    return groups;
  }, {});

  // Loading state
  if (loading) {
    return (
      <div className="events-loading">
        <div className="events-loader"></div>
        <p>Discovering exciting events...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="events-message">
        <span>⚠️</span>
        <h2>Something went wrong</h2>
        <p>{error}</p>

        <button type="button" onClick={getEvents}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="events-page">
      {/* Hero Section */}
      <section className="events-hero">
        <div className="events-hero-content">
          <span className="events-hero-tag">
            STUDENT EVENT PORTAL
          </span>

          <h1>Discover Amazing Events ✨</h1>

          <p>
            Explore cultural celebrations, technical competitions,
            music festivals, and exciting college activities.
          </p>

          <button
            type="button"
            className="events-explore-btn"
            onClick={() =>
              document.getElementById("events-list")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Explore Events ↓
          </button>
        </div>

        <div className="events-hero-icon">🎓</div>
      </section>

      {/* Event Gallery */}
      <section className="events-section" id="events-list">
        <div className="events-section-heading">
          <div>
            <span className="events-section-tag">
              FIND YOUR NEXT EXPERIENCE
            </span>

            <h2>Event Gallery</h2>

            <p>
              Discover events organized by college committees.
            </p>
          </div>

          <div className="events-total">
            <span>📅</span>

            <div>
              <strong>{events.length}</strong>
              <small>Available Events</small>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 ? (
          <div className="events-empty">
            <span>📭</span>
            <h3>No Events Available</h3>

            <p>
              New events will appear here. Please check again later.
            </p>
          </div>
        ) : (
          <div className="committee-event-sections">
            {Object.entries(groupedEvents).map(
              ([committeeName, group]) => {
                const isExpanded =
                  Boolean(expandedCommittees[committeeName]);

                const visibleEvents = isExpanded
                  ? group.events
                  : group.events.slice(0, 3);

                return (
                  <section
                    className="committee-event-section"
                    key={committeeName}
                  >
                    {/* Committee Heading */}
                    <div className="committee-event-heading">
                      <div>
                        <span className="committee-label">
                          EVENT COLLECTION
                        </span>

                        <h2>{committeeName}</h2>

                        <p>{group.description}</p>
                      </div>

                      <span className="committee-event-count">
                        {group.events.length}{" "}
                        {group.events.length === 1
                          ? "Event"
                          : "Events"}
                      </span>
                    </div>

                    {/* Compact Event Cards */}
                    <div className="events-grid">
                      {visibleEvents.map((event) => (
                        <article
                          className="event-card"
                          key={event._id}
                        >
                          {/* Event Image */}
                          <div className="event-image-wrapper">
                            {event.image ? (
                              <img
                                src={event.image}
                                alt={
                                  event.eventName || "College event"
                                }
                                className="event-card-image"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";

                                  const placeholder =
                                    e.currentTarget.nextElementSibling;

                                  if (placeholder) {
                                    placeholder.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}

                            <div
                              className="event-placeholder-image"
                              style={{
                                display: event.image ? "none" : "flex",
                              }}
                            >
                              <span>🎉</span>
                              <p>Event Experience</p>
                            </div>
                          </div>

                          {/* Essential Event Information */}
                          <div className="event-card-content">
                            <h3>
                              {event.eventName || "Untitled Event"}
                            </h3>

                            <div className="event-date-info">
                              <span>📅</span>
                              {formatDate(event.eventdate)}
                            </div>

                            {event.venue && (
                              <div className="event-venue">
                                <span>📍</span>
                                <span>{event.venue}</span>
                              </div>
                            )}

                            {/* View Details */}
                            <div className="event-card-footer">
                              <button
                                type="button"
                                className="event-details-btn"
                                onClick={() =>
                                  navigate(`/event/${event._id}`)
                                }
                              >
                                View Details <span>→</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    {/* View All / Show Less */}
                    {group.events.length > 3 && (
                      <button
                        type="button"
                        className="committee-toggle-btn"
                        onClick={() =>
                          toggleCommittee(committeeName)
                        }
                      >
                        {isExpanded
                          ? "Show Less ↑"
                          : `View All ${group.events.length} Events ↓`}
                      </button>
                    )}
                  </section>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;
