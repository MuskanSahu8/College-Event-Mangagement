
import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Feedback = () => {
  const { user } = useAuth();
  const { id } = useParams();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // GET FEEDBACK
  const getFeedback = async () => {
    try {
      setFetchLoading(true);

      const response = await ApiClient.get(
        `/feedback/event/${id}`
      );

      setFeedbacks(response.data.feedback || []);
    } catch (error) {
      console.log(
        "GET FEEDBACK ERROR:",
        error.response?.data?.message || error.message
      );
    } finally {
      setFetchLoading(false);
    }
  };

  // LOAD FEEDBACK
  useEffect(() => {
    setCurrentPage(1);
    getFeedback();
  }, [id]);

  // CHECK IF USER ALREADY REVIEWED
  const userFeedback = feedbacks.find(
    (feedback) =>
      String(feedback.user?._id) ===
      String(user?._id || user?.id)
  );

  // SUBMIT FEEDBACK
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id || rating < 1 || rating > 5 || !comment.trim()) {
      alert("Please select a rating and enter your comment");
      return;
    }

    try {
      setLoading(true);

      const response = await ApiClient.post(
        "/feedback/create",
        {
          event: id,
          rating,
          comment: comment.trim(),
        }
      );

      alert(response.data.message);

      setComment("");
      setRating(5);

      await getFeedback();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  // RATING SUMMARY
  const totalReviews = feedbacks.length;

  const averageRating =
    totalReviews === 0
      ? "0.0"
      : (
          feedbacks.reduce(
            (total, item) => total + Number(item.rating),
            0
          ) / totalReviews
        ).toFixed(1);

  // PAGINATION
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

  const currentReviews = feedbacks.slice(
    indexOfFirstReview,
    indexOfLastReview
  );

  const totalPages = Math.ceil(
    feedbacks.length / reviewsPerPage
  );

  // EDIT FEEDBACK
  const handleEdit = async (feedbackId) => {
    if (
      editRating < 1 ||
      editRating > 5 ||
      !editComment.trim()
    ) {
      alert("Please enter a valid rating and comment");
      return;
    }

    try {
      const response = await ApiClient.put(
        `/feedback/${feedbackId}`,
        {
          rating: editRating,
          comment: editComment.trim(),
        }
      );

      alert(response.data.message);
      setEditingId(null);
      await getFeedback();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update feedback"
      );
    }
  };

  // DELETE FEEDBACK
  const handleDelete = async (feedbackId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this feedback?"
    );

    if (!confirmDelete) return;

    try {
      const response = await ApiClient.delete(
        `/feedback/${feedbackId}`
      );

      alert(response.data.message);

      // Adjust page if its last review was deleted
      if (
        currentReviews.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage((page) => page - 1);
      }

      await getFeedback();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to delete feedback"
      );
    }
  };
return (
  <div className="feedback-page">

    {/* Page Heading */}
    <div className="feedback-hero">
      <div>
        <span className="feedback-tag">EVENT EXPERIENCE</span>
        <h1>Event Feedback</h1>
        <p>Share your experience and explore what other students think.</p>
      </div>

      <div className="feedback-hero-icon">⭐</div>
    </div>

    {/* Rating Summary */}
    <div className="rating-summary">
      <div>
        <span className="summary-label">OVERALL RATING</span>
        <div className="average-rating">
          <span className="average-number">{averageRating}</span>
          <div>
            <div className="feedback-stars">
              {"★".repeat(Math.round(Number(averageRating)))}
              {"☆".repeat(
                5 - Math.round(Number(averageRating))
              )}
            </div>
            <small>out of 5 stars</small>
          </div>
        </div>
        <p>
          Based on {totalReviews}{" "}
          {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      <div className="rating-summary-icon">💜</div>
    </div>

    {/* Feedback Form */}
    <div className="feedback-container">
      <div className="section-heading">
        <div>
          <span className="feedback-tag">YOUR OPINION MATTERS</span>
          <h2>Give Feedback</h2>
        </div>
      </div>

      {fetchLoading ? (
        <p>Loading feedback form...</p>
      ) : !user ? (
        <p className="feedback-notice">
          Please sign in to submit feedback.
        </p>
      ) : !userFeedback ? (
        <form onSubmit={handleSubmit}>
          <label>How would you rate this event?</label>

          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                role="button"
                tabIndex={0}
                aria-label={`${star} stars`}
                aria-pressed={star <= rating}
                onClick={() => setRating(star)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setRating(star);
                  }
                }}
                className={star <= rating ? "star active" : "star"}
              >
                ★
              </span>
            ))}
            <span className="rating-text">{rating}/5</span>
          </div>

          <label htmlFor="feedback-comment">Your Comment</label>

          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            rows="5"
            required
          />

          <button
            type="submit"
            className="feedback-submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      ) : (
        <div className="feedback-notice">
          <span>✓</span>
          You have already submitted feedback for this event.
          You can edit your existing review below.
        </div>
      )}
    </div>

    {/* Student Reviews */}
    <div className="feedback-list">
      <div className="section-heading">
        <div>
          <span className="feedback-tag">COMMUNITY VOICES</span>
          <h2>Student Feedback</h2>
        </div>

        <span className="review-count">{totalReviews} Reviews</span>
      </div>

      {fetchLoading ? (
        <p className="feedback-empty">Loading feedback...</p>
      ) : feedbacks.length === 0 ? (
        <div className="feedback-empty">
          <span>💬</span>
          <h3>No feedback yet</h3>
          <p>Be the first student to share your experience!</p>
        </div>
      ) : (
        currentReviews.map((feedback) => (
          <div className="feedback-card" key={feedback._id}>
            {editingId === feedback._id ? (
              <div className="edit-feedback">
                <h3>Edit Your Feedback</h3>

                <label>Rating</label>
                <select
                  value={editRating}
                  onChange={(e) =>
                    setEditRating(Number(e.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} Star
                    </option>
                  ))}
                </select>

                <label>Comment</label>
                <textarea
                  value={editComment}
                  onChange={(e) =>
                    setEditComment(e.target.value)
                  }
                  rows="4"
                />

                <div className="feedback-actions">
                  <button
                    type="button"
                    className="save-btn"
                    onClick={() => handleEdit(feedback._id)}
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="feedback-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {(feedback.user?.name || "A")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3>
                        {feedback.user?.name || "Anonymous"}
                      </h3>
                      <small>
                        {feedback.createdAt
                          ? new Date(
                              feedback.createdAt
                            ).toLocaleDateString("en-IN")
                          : ""}
                      </small>
                    </div>
                  </div>

                  <div className="feedback-rating">
                    {"★".repeat(Number(feedback.rating))}
                    {"☆".repeat(
                      5 - Number(feedback.rating)
                    )}
                  </div>
                </div>

                <p className="feedback-comment">
                  {feedback.comment}
                </p>

                {user &&
                  String(feedback.user?._id) ===
                    String(user._id || user.id) && (
                    <div className="feedback-actions">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => {
                          setEditingId(feedback._id);
                          setEditRating(feedback.rating);
                          setEditComment(feedback.comment);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(feedback._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
              </>
            )}
          </div>
        ))
      )}

      {/* Pagination */}
      {!fetchLoading && totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((page) => page - 1)
            }
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => page + 1)
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default Feedback;
