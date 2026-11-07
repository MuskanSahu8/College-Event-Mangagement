
import React, { useCallback, useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import "../style/StudentNotifications.css";

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    try {
      setError("");

      const response = await ApiClient.get("/notification");
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await ApiClient.patch(
        `/notification/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark notification as read."
      );
    }
  };

  const visibleNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString();
  };

  return (
    <div className="student-notifications-page">
      <div className="student-notifications-header">
        <div>
          <p className="notification-eyebrow">STUDENT PORTAL</p>
          <h1>Notifications</h1>
          <p>Stay updated with announcements from your organizers.</p>
        </div>

        <div className="student-unread-card">
          <span className="student-bell">🔔</span>
          <div>
            <strong>{unreadCount}</strong>
            <span>Unread</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="student-notification-error">
          {error}
          <button onClick={fetchNotifications}>Retry</button>
        </div>
      )}

      <div className="student-notification-toolbar">
        <div>
          <h2>Your updates</h2>
          <span>{notifications.length} total notifications</span>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter notifications"
        >
          <option value="all">All notifications</option>
          <option value="unread">Unread only</option>
          <option value="read">Read only</option>
        </select>
      </div>

      {loading ? (
        <p className="student-notification-state">Loading notifications...</p>
      ) : visibleNotifications.length === 0 ? (
        <div className="student-notification-empty">
          <span>🔔</span>
          <h3>No notifications here</h3>
          <p>
            {filter === "unread"
              ? "You're all caught up!"
              : "Organizer announcements will appear here."}
          </p>
        </div>
      ) : (
        <div className="student-notification-list">
          {visibleNotifications.map((notification) => (
            <article
              key={notification._id}
              className={`student-notification-card ${
                notification.isRead ? "is-read" : "is-unread"
              }`}
            >
              <div className="student-notification-icon">
                {notification.isRead ? "✓" : "🔔"}
              </div>

              <div className="student-notification-content">
                <div className="student-notification-title-row">
                  <h3>{notification.title || "Event announcement"}</h3>
                  {!notification.isRead && (
                    <span className="unread-dot" title="Unread" />
                  )}
                </div>

                <p className="student-notification-message">
                  {notification.message}
                </p>

                {notification.event && (
                  <div className="student-notification-event">
                    <strong>Event:</strong>{" "}
                    {notification.event.eventName}
                    {notification.event.eventdate && (
                      <span>
                        {" "}
                        ·{" "}
                        {new Date(
                          notification.event.eventdate
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                <span className="student-notification-date">
                  {formatDate(notification.createdAt)}
                </span>
              </div>

              {!notification.isRead && (
                <button
                  className="mark-notification-read"
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  Mark as read
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
