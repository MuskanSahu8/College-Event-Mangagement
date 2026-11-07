import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ApiClient from "../apiClient/Interceptor";
import "../style/Org.css";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: "",
    about: "",
    eventdate: "",
    lastDate: "",
    dept: "",
    venue: "",
    startTime: "",
    endTime: "",
    capacity: "",
  });

  const [existingImage, setExistingImage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Get existing event details
  useEffect(() => {
    const getEvent = async () => {
      try {
        const response = await ApiClient.get(`/event/get/${id}`);
        const event = response.data.event;

        setFormData({
          eventName: event.eventName || "",
          about: event.about || "",
          eventdate: event.eventdate
            ? String(event.eventdate).slice(0, 10)
            : "",
          lastDate: event.lastDate
            ? String(event.lastDate).slice(0, 10)
            : "",
          dept: event.dept || "",
          venue: event.venue || "",
          startTime: event.startTime || "",
          endTime: event.endTime || "",
          capacity: event.capacity ?? "",
        });

        setExistingImage(event.image || "");
      } catch (error) {
        console.error("GET EVENT ERROR:", error.response?.data || error);
        setMessage("Unable to load event details.");
      } finally {
        setLoading(false);
      }
    };

    getEvent();
  }, [id]);

  // Preview selected image
  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate and select replacement image
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image.");
      setImage(null);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5 MB.");
      setImage(null);
      e.target.value = "";
      return;
    }

    setImageError("");
    setImage(file);
  };

  // Update event
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (imageError) {
    toast.error(imageError);
    return;
  }

  try {
    const data = new FormData();

    data.append("eventName", formData.eventName);
    data.append("about", formData.about);
    data.append("eventdate", formData.eventdate);
    data.append("lastDate", formData.lastDate);
    data.append("dept", formData.dept);
    data.append("venue", formData.venue);
    data.append("startTime", formData.startTime);
    data.append("endTime", formData.endTime);
    data.append("capacity", formData.capacity);

    if (image) {
      data.append("image", image);
    }

    await ApiClient.put(`/event/update/${id}`, data);

    toast.success("Event updated successfully!");

    setTimeout(() => {
      navigate("/my-events");
    }, 1500);

  } catch (error) {
    console.error("Update error:", error.response?.data || error);

    toast.error(
      error.response?.data?.message || "Failed to update event."
    );
  }
};
  if (loading) {
    return (
      <div className="edit-loading">
        <div className="edit-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="edit-event-page">
      <div className="edit-event-container">
        <div className="edit-event-header">
          <div className="edit-header-icon">✎</div>
          <div>
            <h2>Edit Event</h2>
            <p>Update your event details and make it more exciting.</p>
          </div>
        </div>

        {message && <div className="edit-message">{message}</div>}

        <form onSubmit={handleSubmit} className="edit-event-form">
          <div className="edit-form-section">
            <h3>Event Information</h3>
            <p>Update the basic information about your event.</p>

            <div className="edit-form-group">
              <label htmlFor="eventName">Event Name</label>
              <input
                id="eventName"
                type="text"
                name="eventName"
                placeholder="Enter event name"
                value={formData.eventName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="about">About Event</label>
              <textarea
                id="about"
                name="about"
                placeholder="Describe your event..."
                value={formData.about}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <div className="edit-form-row">
              <div className="edit-form-group">
                <label htmlFor="eventdate">Event Date</label>
                <input
                  id="eventdate"
                  type="date"
                  name="eventdate"
                  value={formData.eventdate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-form-group">
                <label htmlFor="lastDate">
                  Last Registration Date
                </label>
                <input
                  id="lastDate"
                  type="date"
                  name="lastDate"
                  value={formData.lastDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="edit-form-group">
              <label htmlFor="dept">Department</label>
              <input
                id="dept"
                type="text"
                name="dept"
                placeholder="e.g. CSE, Mechanical"
                value={formData.dept}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="edit-form-group">
            <label htmlFor="venue">Event Venue</label>
            <input
              id="venue"
              type="text"
              name="venue"
              placeholder="e.g. Main Auditorium, Block A"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                id="startTime"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                id="endTime"
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min={formData.startTime || undefined}
                required
              />
            </div>
          </div>

          <div className="edit-form-group">
            <label htmlFor="capacity">Maximum Registrations</label>
            <input
              id="capacity"
              type="number"
              name="capacity"
              placeholder="e.g. 100"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              step="1"
              required
            />
          </div>
          <div className="edit-form-section">
            <h3>Event Image</h3>
            <p>Keep your current image or upload a replacement.</p>

            {existingImage && !imagePreview && (
              <div className="edit-image-preview">
                <span>Current Event Image</span>
                <img src={existingImage} alt="Current event" />
              </div>
            )}

            {imagePreview && (
              <div className="edit-image-preview">
                <span>New Image Preview</span>
                <img src={imagePreview} alt="New event preview" />
              </div>
            )}

            <label htmlFor="image" className="edit-upload-area">
              <span className="edit-upload-icon">📷</span>
              <strong>Choose a new event image</strong>
              <small>PNG, JPG or JPEG · Maximum size 5 MB</small>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {imageError && (
              <p className="edit-image-error">{imageError}</p>
            )}
          </div>

          <div className="edit-form-actions">
            <button type="button" className="edit-cancel-btn"
              onClick={() => navigate("/my-events")}>
              Cancel
            </button>

            <button
              type="submit"
              className="edit-save-btn"
              disabled={!!imageError}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;