import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import "../style/MyFeedback.css";

const MyFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMyFeedback = async () => {
    try {
      const response = await ApiClient.get("/feedback/my-feedback");
      setFeedbacks(response.data.feedback || []);
    } catch (error) {
      console.log(
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyFeedback();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="myfeedback-loading">
        <div className="myfeedback-spinner"></div>
        <p>Loading your feedback...</p>
      </div>
    );
  }

  return (
    <div className="my-feedback-page">

      {/* Page Header */}
      <div className="myfeedback-hero">
        <div>
          <span>STUDENT PANEL</span>
          <h1>My Feedback</h1>
          <p>
            View all the reviews and experiences you have shared
            with event organizers.
          </p>
        </div>

        <div className="myfeedback-hero-icon">💬</div>
      </div>

      {/* Feedback Summary */}
      <div className="myfeedback-summary">
        <div>
          <span className="myfeedback-summary-label">
            TOTAL REVIEWS
          </span>
          <h2>{feedbacks.length}</h2>
          <p>Feedback submissions</p>
        </div>

        <div className="myfeedback-summary-icon">⭐</div>
      </div>

      {/* Feedback List */}
      <div className="myfeedback-section">
        <div className="myfeedback-section-heading">
          <div>
            <span>YOUR EXPERIENCE</span>
            <h2>Submitted Reviews</h2>
          </div>
        </div>

        {feedbacks.length === 0 ? (
          <div className="myfeedback-empty">
            <div>📝</div>
            <h3>No Feedback Yet</h3>
            <p>
              You haven't submitted any feedback yet.
              Attend an event and share your experience!
            </p>
          </div>
        ) : (
          <div className="myfeedback-list">
            {feedbacks.map((item) => (
              <div
                className="myfeedback-card"
                key={item._id}
              >
                <div className="myfeedback-card-header">
                  <div className="myfeedback-event-icon">
                    🎉
                  </div>

                  <div className="myfeedback-event-info">
                    <span>EVENT REVIEW</span>
                    <h3>
                      {item.event?.eventName ||
                        "Event unavailable"}
                    </h3>
                  </div>

                  <div className="myfeedback-rating">
                    {"★".repeat(
                      Math.min(5, Math.max(0, Number(item.rating) || 0))
                    )}
                    {"☆".repeat(
                      5 - Math.min(5, Math.max(0, Number(item.rating) || 0))
                    )}
                  </div>
                </div>

                <div className="myfeedback-comment">
                  <p>"{item.comment}"</p>
                </div>

                <div className="myfeedback-card-footer">
                  <div>
                    <span>Submitted On</span>
                    <strong>{formatDate(item.createdAt)}</strong>
                  </div>

                  <div>
                    <span>Event Date</span>
                    <strong>
                      {formatDate(item.event?.eventdate)}
                    </strong>
                  </div>

                  <div className="myfeedback-rating-number">
                    <span>Your Rating</span>
                    <strong>{Number(item.rating) || 0}/5</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFeedback;