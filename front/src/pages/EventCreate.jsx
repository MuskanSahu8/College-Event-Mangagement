
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApiClient from "../apiClient/Interceptor";
import { useNavigate } from "react-router-dom";
import "../style/Org.css";
import "../style/org-orange-theme.css";

const EventCreate = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState({
    eventName: "",
    about: "",
    eventdate: "",
    lastDate: "",
    dept: "",
    committee: "",
    venue: "",
    startTime: "",
    endTime: "",
    capacity: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [committees, setCommittees] = useState([]);
  const [committeeLoading, setCommitteeLoading] = useState(true);
  const [committeeError, setCommitteeError] = useState("");

  // Image preview
  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  // Handle text fields
  const handleChange = (e) => {
    setEvents({
      ...events,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image.");
      setImage(null);
      e.target.value = "";

       toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5 MB.");
      setImage(null);
      e.target.value = "";


  toast.warning("Image size must be less than 5 MB.");
      return;
    }

    setImageError("");
    setImage(file);
    toast.success("Image selected successfully!");
  };

// Create event
const createEvent = async (e) => {
  e.preventDefault();

  // Image validation
  if (imageError) {
    toast.error(imageError);
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("eventName", events.eventName);
    formData.append("about", events.about);
    formData.append("eventdate", events.eventdate);
    formData.append("lastDate", events.lastDate);
    formData.append("dept", events.dept);
    formData.append("committee", events.committee);
    formData.append("venue", events.venue);
    formData.append("startTime", events.startTime);
    formData.append("endTime", events.endTime);
    formData.append("capacity", events.capacity);

    if (image) {
      formData.append("image", image);
    }

    const response = await ApiClient.post(
      "/event/create",
      formData
    );

    console.log(response.data);

    // Success notification
    toast.success("Event created successfully!");

    // Reset form fields
    setEvents({
      eventName: "",
      about: "",
      eventdate: "",
      lastDate: "",
      dept: "",
      committee: "",
      venue: "",
      startTime: "",
      endTime: "",
      capacity: "",
    });

    // Reset image
    setImage(null);
    setImageError("");

    // Navigate after toast appears
    setTimeout(() => {
      navigate("/my-events");
    }, 1500);

  } catch (error) {
    console.error(
      "Error creating event:",
      error.response?.data?.message || error.message
    );

    // Error notification
    toast.error(
      error.response?.data?.message ||
      "Failed to create event. Please try again."
    );

  } finally {
    setLoading(false);
  }
};
 
  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const response = await ApiClient.get("/committee");

        const data = response.data;

        setCommittees(
          Array.isArray(data)
            ? data
            : data.committees || data.data || []
        );
      } catch (error) {
        console.error(
          "Error fetching committees:",
          error.response?.data?.message || error.message
        );

        setCommitteeError(
          error.response?.data?.message ||
          "Unable to load committees. Please try again."
        );
      } finally {
        setCommitteeLoading(false);
      }
    };

    fetchCommittees();
  }, []);
  return (
    <div className="event-create-page">

      <div className="event-create-header">
        <div>
          <span className="event-create-tag">
            ORGANIZER PANEL
          </span>

          <h1>Create New Event</h1>

          <p>
            Fill in the details below to publish your event.
          </p>
        </div>
      </div>

      <div className="event-create-card">

       
<form onSubmit={createEvent}>

  {/* Event Information */}
  <div className="form-section-title">
    <span className="section-icon">📋</span>
    <div>
      <h2>Event Information</h2>
      <p>Enter the basic details of your event.</p>
    </div>
  </div>

  <div className="event-form-grid">

    <div className="event-form-field full-width">
      <label htmlFor="eventName">Event Name *</label>
      <input
        id="eventName"
        type="text"
        name="eventName"
        value={events.eventName}
        placeholder="Enter event name"
        onChange={handleChange}
        required
      />
    </div>

    <div className="event-form-field full-width">
      <label htmlFor="about">About Event *</label>
      <textarea
        id="about"
        name="about"
        value={events.about}
        placeholder="Describe your event..."
        onChange={handleChange}
        rows="4"
        required
      />
    </div>

    <div className="event-form-field">
      <label htmlFor="eventdate">Event Date *</label>
      <input
        id="eventdate"
        type="date"
        name="eventdate"
        value={events.eventdate}
        onChange={handleChange}
        required
      />
    </div>

    <div className="event-form-field">
      <label htmlFor="lastDate">Last Registration Date</label>
      <input
        id="lastDate"
        type="date"
        name="lastDate"
        value={events.lastDate}
        onChange={handleChange}
        max={events.eventdate || undefined}
      />
    </div>

    <div className="event-form-field">
      <label htmlFor="dept">Department</label>
      <input
        id="dept"
        type="text"
        name="dept"
        value={events.dept}
        placeholder="e.g. CSE, Mechanical, ECE"
        onChange={handleChange}
      />
    </div>

    <div className="event-form-field">
      <label htmlFor="committee">Select Committee *</label>
      <select
        id="committee"
        name="committee"
        value={events.committee}
        onChange={handleChange}
        required
        disabled={committeeLoading || committees.length === 0}
      >
        <option value="">
          {committeeLoading
            ? "Loading committees..."
            : committees.length === 0
              ? "No committees available"
              : "Choose a committee"}
        </option>

        {committees.map((committee) => (
          <option key={committee._id} value={committee._id}>
            {committee.name}
          </option>
        ))}
      </select>

      {committeeError && (
        <p className="event-image-error">{committeeError}</p>
      )}
    </div>

    <div className="event-form-field full-width">
      <label htmlFor="venue">Event Venue *</label>
      <input
        id="venue"
        type="text"
        name="venue"
        value={events.venue}
        placeholder="e.g. Main Auditorium, Block A"
        onChange={handleChange}
        required
      />
    </div>

    <div className="event-form-field">
      <label htmlFor="startTime">Start Time *</label>
      <input
        id="startTime"
        type="time"
        name="startTime"
        value={events.startTime}
        onChange={handleChange}
        required
      />
    </div>

    <div className="event-form-field">
      <label htmlFor="endTime">End Time *</label>
      <input
        id="endTime"
        type="time"
        name="endTime"
        value={events.endTime}
        onChange={handleChange}
        required
        min={events.startTime || undefined}
      />
    </div>

    <div className="event-form-field">
      <label htmlFor="capacity">
        Maximum Registrations *
      </label>
      <input
        id="capacity"
        type="number"
        name="capacity"
        value={events.capacity}
        placeholder="e.g. 100"
        onChange={handleChange}
        min="1"
        step="1"
        required
      />
    </div>

  </div>

  {/* Event Cover Image */}
  <div className="form-section-title image-section-title">
    <span className="section-icon">🖼️</span>
    <div>
      <h2>Event Cover Image</h2>
      <p>Add an image to make your event attractive.</p>
    </div>
  </div>

  <div className="image-upload-area">
    <input
      id="image"
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      hidden
    />

    {!imagePreview ? (
      <label htmlFor="image" className="image-upload-label">
        <div className="upload-icon">☁️</div>
        <h3>Upload Event Image</h3>
        <p>Click here to select an image from your device</p>
        <span>PNG, JPG, JPEG · Maximum 5 MB</span>
        <div className="upload-button">Choose Image</div>
      </label>
    ) : (
      <div className="image-preview-container">
        <img
          src={imagePreview}
          alt="Event preview"
          className="event-image-preview"
        />

        <div className="image-preview-info">
          <div>
            <strong>{image.name}</strong>
            <p>
              {(image.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          <label htmlFor="image" className="change-image-button">
            Change Image
          </label>
        </div>
      </div>
    )}
  </div>

  {imageError && (
    <p className="event-image-error">{imageError}</p>
  )}

  {/* Form Actions */}
  <div className="event-form-actions">
    <button
      type="button"
      className="event-cancel-button"
      onClick={() => navigate(-1)}
      disabled={loading}
    >
      Cancel
    </button>

    <button
      type="submit"
      className="event-submit-button"
      disabled={loading || committeeLoading || committees.length === 0}
    >
      {loading ? "Creating Event..." : "Create Event →"}
    </button>
  </div>

</form>

      </div>
    </div>
  );
};

export default EventCreate;
