
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../apiClient/Interceptor";
import "../style/Org.css";
import "../style/org-orange-theme.css";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Expand or collapse events separately for each committee
  const [expandedCommittees, setExpandedCommittees] = useState({});
  const [exportingId, setExportingId] = useState(null);

  const navigate = useNavigate();

  // Fetch events
  useEffect(() => {
    const getMyEvents = async () => {
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
        console.error("Fetch events error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load your events."
        );
      } finally {
        setLoading(false);
      }
    };

    getMyEvents();
  }, []);

  // Delete event
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) return;

    try {
      await ApiClient.delete(`/event/delete/${id}`);

      setEvents((previousEvents) =>
        previousEvents.filter((event) => event._id !== id)
      );

      alert("Event deleted successfully!");
    } catch (err) {
      console.error("Delete event error:", err);

      alert(
        err.response?.data?.message ||
        "Failed to delete event."
      );
    }
  };

  const handleExportCSV = async (event) => {
    try {
      setExportingId(event._id);

      // Fetch registrations for this particular event
      const response = await ApiClient.get(
        `/register/event/${event._id}/registrations`
      );

      const registrations = response.data.registrations || [];

      if (registrations.length === 0) {
        alert("No registrations available for this event.");
        return;
      }

      // CSV column headings
      const headers = [
        "Student Name",
        "Email",
        "Phone",
        "Department",
        "Class",
        "University Roll Number",
        "Registration Date",
      ];

      // Escape CSV values safely
      const escapeCSV = (value) => {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection
        if (/^[\s]*[=+\-@\t\r]/.test(text)) {
          text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
      };

      // Convert registration data into CSV rows
      const rows = registrations.map((student) => [
        student.name,
        student.email,
        student.phone,
        student.dept,
        student.className,
        student.universityRollno,
        student.createdAt
          ? new Date(student.createdAt).toLocaleDateString("en-IN")
          : "N/A",
      ]);

      const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
      ].join("\r\n");

      // Create downloadable CSV file
      const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download =
        `${(event.eventName || "Event").replace(/[^a-z0-9_-]/gi, "_")}_Registrations.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("CSV export error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to export registrations. Please try again."
      );

    } finally {
      setExportingId(null);
    }
  };


  // Format date safely
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

  // Today's date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Search and filter events
  const filteredEvents = events.filter((event) => {
    const searchText = search.trim().toLowerCase();

    const eventName = (event.eventName || "").toLowerCase();
    const department = (
      typeof event.dept === "string" ? event.dept : ""
    ).toLowerCase();
    const committeeName = (
      event.committee?.name || ""
    ).toLowerCase();

    const matchesSearch =
      eventName.includes(searchText) ||
      department.includes(searchText) ||
      committeeName.includes(searchText);

    const eventDate = event.eventdate
      ? new Date(event.eventdate)
      : null;

    if (eventDate && !Number.isNaN(eventDate.getTime())) {
      eventDate.setHours(0, 0, 0, 0);
    }

    const hasValidDate =
      eventDate && !Number.isNaN(eventDate.getTime());

    const isUpcoming =
      hasValidDate && eventDate >= today;

    const isPast =
      hasValidDate && eventDate < today;

    const capacity = Number(event.capacity) || 0;
    const registrationCount =
      Number(event.registrationCount) || 0;

    const isFull =
      capacity > 0 && registrationCount >= capacity;

    let matchesStatus = true;

    if (statusFilter === "upcoming") {
      matchesStatus = Boolean(isUpcoming);
    } else if (statusFilter === "past") {
      matchesStatus = Boolean(isPast);
    } else if (statusFilter === "full") {
      matchesStatus = isFull;
    }

    return matchesSearch && matchesStatus;
  });

  // Group filtered events by committee
  const groupedEvents = filteredEvents.reduce(
    (groups, event) => {
      const committeeName =
        event.committee?.name || "Other Events";

      if (!groups[committeeName]) {
        groups[committeeName] = [];
      }

      groups[committeeName].push(event);

      return groups;
    },
    {}
  );

  // Toggle one committee without affecting other committees
  const toggleCommittee = (committeeName) => {
    setExpandedCommittees((previous) => ({
      ...previous,
      [committeeName]: !previous[committeeName],
    }));
  };

  return (
    <div className="my-events-page">
      {/* Page Header */}
      <div className="my-events-header">
        <div>
          <span className="my-events-tag">
            ORGANIZER PANEL
          </span>

          <h1>My Events</h1>

          <p>
            Manage, update and explore the events you have
            created.
          </p>
        </div>

        <button
          type="button"
          className="create-event-btn"
          onClick={() => navigate("/create")}
        >
          <span>＋</span> Create Event
        </button>
      </div>

      {/* Event Count */}
      {!loading && !error && (
        <div className="event-count-card">
          <div className="event-count-icon">📅</div>

          <div>
            <h2>{events.length}</h2>
            <p>Total Events</p>

            <small>
              Showing {filteredEvents.length} matching event(s)
            </small>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {!loading && !error && events.length > 0 && (
        <div className="my-events-filters">
          <input
            type="text"
            placeholder="Search by event, department or committee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search events"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter events by status"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
            <option value="full">Fully Registered</option>
          </select>

          <button
            type="button"
            className="view-event-btn"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="my-events-message">
          <div className="events-loader"></div>
          <p>Loading your events...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="my-events-message error-message">
          <span>⚠️</span>
          <p>{error}</p>

          <button
            type="button"
            className="view-event-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Events State */}
      {!loading && !error && events.length === 0 && (
        <div className="my-events-empty">
          <div className="empty-event-icon">📭</div>

          <h2>No Events Yet!</h2>

          <p>
            You haven't created any events. Start by creating
            your first event.
          </p>

          <button
            type="button"
            onClick={() => navigate("/create")}
            className="create-event-btn"
          >
            + Create Your First Event
          </button>
        </div>
      )}

      {/* No Search Results */}
      {!loading &&
        !error &&
        events.length > 0 &&
        filteredEvents.length === 0 && (
          <div className="my-events-empty">
            <div className="empty-event-icon">🔎</div>

            <h2>No Matching Events</h2>

            <p>
              Try another search term or change the selected
              filter.
            </p>
          </div>
        )}

      {/* Events Grouped by Committee */}
      {!loading && !error && filteredEvents.length > 0 && (
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
                                  placeholder.style.display = "flex";
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

                        {/* Event Information */}
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
                          <div className="my-event-actions">
                            <button
                              type="button"
                              className="view-event-btn"
                              onClick={() =>
                                navigate(`/event/${event._id}`)
                              }
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              className="export-csv-btn"
                              onClick={() => handleExportCSV(event)}
                              disabled={exportingId === event._id}
                            >
                              {exportingId === event._id
                                ? "Exporting..."
                                : "↓ Export CSV"}
                            </button>

                            <button
                              type="button"
                              className="edit-event-btn"
                              onClick={() =>
                                navigate(
                                  `/event/${event._id}/edit`
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-event-btn"
                              onClick={() =>
                                handleDelete(event._id)
                              }
                            >
                              Delete
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
  );
};

export default MyEvents;
