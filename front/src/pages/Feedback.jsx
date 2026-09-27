import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import { useParams } from "react-router-dom";

const Feedback = () => {
  const { id } = useParams();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [feedbacks, setFeedbacks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // GET FEEDBACK
  const getFeedback = async () => {
    try {
      setFetchLoading(true);

      const response = await ApiClient.get(
        `/feedback/event/${id}`
      );

       console.log("FULL RESPONSE:", response);
    console.log("RESPONSE DATA:", response.data);
    console.log("FEEDBACK:", response.data.feedback);

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

  // GET FEEDBACK WHEN PAGE LOADS
  useEffect(() => {
    getFeedback();
  }, [id]);


  // SUBMIT FEEDBACK
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id || !rating || !comment.trim()) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const response = await ApiClient.post(
        "/feedback/create",
        {
          event: id,
          rating: rating,
          comment: comment,
        }
      );

      alert(response.data.message);
    setFeedbacks(response.data);
      setComment("");
      setRating(5);

      // refresh feedback
      getFeedback();

    } catch (error) {
      console.log("FEEDBACK ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="feedback-page">

      {/* FORM */}

      <div className="feedback-container">

        <h2>Give Feedback</h2>

        <form onSubmit={handleSubmit}>

          <label>Rating</label>

          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  cursor: "pointer",
                  fontSize: "30px",
                  color: star <= rating ? "gold" : "gray",
                }}
              >
                ★
              </span>
            ))}
          </div>

          <label>Comment</label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your feedback..."
            rows="5"
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Submitting..."
              : "Submit Feedback"}
          </button>

        </form>

      </div>


      {/* FEEDBACK LIST */}

      <div className="feedback-list">

        <h2>Student Feedback</h2>

        {fetchLoading ? (
          <p>Loading feedback...</p>
        ) : feedbacks.length === 0 ? (
          <p>No feedback yet.</p>
        ) : (
          feedbacks.map((feedback) => (
            <div
              className="feedback-card"
              key={feedback._id}
            >

              <div className="feedback-header">

                <h3>
                  {feedback.user?.name || "Anonymous"}
                </h3>

                <div className="feedback-rating">
                  {"★".repeat(feedback.rating)}
                  {"☆".repeat(5 - feedback.rating)}
                </div>

              </div>

              <p className="feedback-comment">
                {feedback.comment}
              </p>

              <small>
                {new Date(
                  feedback.createdAt
                ).toLocaleDateString()}
              </small>

            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default Feedback;