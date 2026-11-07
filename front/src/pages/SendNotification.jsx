
import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import { useAuth } from "../context/AuthContext";
import "../style/Org.css";
import "../style/org-orange-theme.css";

const SendNotification = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await ApiClient.get("/event/get");
        const data = response.data;

        const allEvents = Array.isArray(data)
          ? data
          : data.events || data.data || [];

        // Show events created by the logged-in organizer.
        const myEvents = allEvents.filter((event) => {
          const ownerId =
            typeof event.user === "object"
              ? event.user?._id
              : event.user;

          return ownerId && String(ownerId) === String(user?._id);
        });

        setEvents(myEvents);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load your events."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchEvents();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!eventId || !title.trim() || !message.trim()) {
      setError("Please select an event and enter the title and message.");
      return;
    }

    try {
      setSending(true);

      const response = await ApiClient.post(
        "/notification/announcement",
        {
          eventId,
          title: title.trim(),
          message: message.trim(),
        }
      );

      setSuccess(
        `${response.data.message}. Sent to ${response.data.recipientsCount} students.`
      );

      setTitle("");
      setMessage("");
      setEventId("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send notification."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="send-notification-page">
      <div className="notification-page-header">
        <div>
          <p className="notification-eyebrow">COMMUNICATION CENTER</p>
          <h1>Send Notification</h1>
          <p>
            Share important event updates and announcements with your students.
          </p>
        </div>

        <div className="notification-header-icon">🔔</div>
      </div>

      {error && (
        <div className="notification-alert notification-error">
          {error}
        </div>
      )}

      {success && (
        <div className="notification-alert notification-success">
          {success}
        </div>
      )}

      <div className="notification-form-card">
        <h2>Create an announcement</h2>
        <p className="notification-form-description">
          Students will receive this announcement in their notification list.
        </p>

        {loading ? (
          <p className="notification-loading">Loading your events...</p>
        ) : events.length === 0 ? (
          <div className="notification-empty">
            <h3>No events found</h3>
            <p>
              Create an event first, then return here to send an announcement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="notification-form-group">
              <label htmlFor="notification-event">Select event</label>
              <select
                id="notification-event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
              >
                <option value="">Choose your event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </div>

            <div className="notification-form-group">
              <label htmlFor="notification-title">Notification title</label>
              <input
                id="notification-title"
                type="text"
                placeholder="e.g. Registration closing soon!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="notification-form-group">
              <label htmlFor="notification-message">Message</label>
              <textarea
                id="notification-message"
                placeholder="Write the important event update for students..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={1000}
                required
              />
              <small>{message.length}/1000 characters</small>
            </div>

            <div className="notification-preview">
              <span className="notification-preview-icon">🔔</span>
              <div>
                <strong>{title.trim() || "Your notification title"}</strong>
                <p>
                  {message.trim() ||
                    "Your announcement preview will appear here."}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="send-notification-btn"
              disabled={sending}
            >
              {sending ? "Sending..." : "Send to All Students"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendNotification;
