
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApiClient from "../apiClient/Interceptor";
import { useNavigate } from "react-router-dom";

import "../style/Org.css";
import "../style/org-orange-theme.css";

const EventCreate = () => {
  const navigate = useNavigate();

  const initialEventState = {
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
  };

  const [events, setEvents] = useState(initialEventState);

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
    const { name, value } = e.target;

    setEvents((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

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

  // Fetch committees
  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        setCommitteeLoading(true);
        setCommitteeError("");

        const response = await ApiClient.get("/committee");

        const data = response.data;

        // Handle different API response formats
        const committeeList = Array.isArray(data)
          ? data
          : data?.committees || data?.data || [];

        // Remove null or invalid committee objects
        const validCommittees = Array.isArray(committeeList)
          ? committeeList.filter(
              (committee) =>
                committee &&
                committee._id &&
                typeof committee.name === "string" &&
                committee.name.trim() !== ""
            )
          : [];

        setCommittees(validCommittees);

        if (validCommittees.length === 0) {
          setCommitteeError(
            "No valid committees found. Please create a committee first."
          );
        }
      } catch (error) {
        console.error(
          "Error fetching committees:",
          error.response?.data?.message || error.message
        );

        setCommittees([]);

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

  // Create event
  const createEvent = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Image validation
    if (imageError) {
      toast.error(imageError);
      return;
    }

    // Committee validation
    if (!events.committee) {
      toast.error("Please select a committee.");
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

      // Append image only if selected
      if (image) {
        formData.append("image", image);
      }

      const response = await ApiClient.post(
        "/event/create",
        formData
      );

      console.log("Event created:", response.data);

      toast.success("Event created successfully!");

      // Reset form
      setEvents(initialEventState);
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

      toast.error(
        error.response?.data?.message ||
          "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-create-page">

      {/* Header */}
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

      {/* Form Card */}
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

            {/* Event Name */}
            <div className="event-form-field full-width">
              <label htmlFor="eventName">
                Event Name *
              </label>

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

            {/* About */}
            <div className="event-form-field full-width">
              <label htmlFor="about">
                About Event *
              </label>

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

            {/* Event Date */}
            <div className="event-form-field">
              <label htmlFor="eventdate">
                Event Date *
              </label>

              <input
                id="eventdate"
                type="date"
                name="eventdate"
                value={events.eventdate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Last Registration Date */}
            <div className="event-form-field">
              <label htmlFor="lastDate">
                Last Registration Date
              </label>

              <input
                id="lastDate"
                type="date"
                name="lastDate"
                value={events.lastDate}
                onChange={handleChange}
                max={events.eventdate || undefined}
              />
            </div>

            {/* Department */}
            <div className="event-form-field">
              <label htmlFor="dept">
                Department
              </label>

              <input
                id="dept"
                type="text"
                name="dept"
                value={events.dept}
                placeholder="e.g. CSE, Mechanical, ECE"
                onChange={handleChange}
              />
            </div>

            {/* Committee */}
            <div className="event-form-field">
              <label htmlFor="committee">
                Select Committee *
              </label>

              <select
                id="committee"
                name="committee"
                value={events.committee}
                onChange={handleChange}
                required
                disabled={
                  committeeLoading ||
                  committees.length === 0
                }
              >
                <option value="">
                  {committeeLoading
                    ? "Loading committees..."
                    : committees.length === 0
                    ? "No committees available"
                    : "Choose a committee"}
                </option>

                {committees.map((committee) => (
                  <option
                    key={committee._id}
                    value={committee._id}
                  >
                    {committee?.name || "Unnamed Committee"}
                  </option>
                ))}
              </select>

              {committeeError && (
                <p className="event-image-error">
                  {committeeError}
                </p>
              )}
            </div>

            {/* Venue */}
            <div className="event-form-field full-width">
              <label htmlFor="venue">
                Event Venue *
              </label>

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

            {/* Start Time */}
            <div className="event-form-field">
              <label htmlFor="startTime">
                Start Time *
              </label>

              <input
                id="startTime"
                type="time"
                name="startTime"
                value={events.startTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* End Time */}
            <div className="event-form-field">
              <label htmlFor="endTime">
                End Time *
              </label>

              <input
                id="endTime"
                type="time"
                name="endTime"
                value={events.endTime}
                onChange={handleChange}
                min={events.startTime || undefined}
                required
              />
            </div>

            {/* Capacity */}
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
              <p>
                Add an image to make your event attractive.
              </p>
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
              <label
                htmlFor="image"
                className="image-upload-label"
              >
                <div className="upload-icon">☁️</div>

                <h3>Upload Event Image</h3>

                <p>
                  Click here to select an image from your device
                </p>

                <span>
                  PNG, JPG, JPEG · Maximum 5 MB
                </span>

                <div className="upload-button">
                  Choose Image
                </div>
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
                    <strong>
                      {image?.name || "Selected Image"}
                    </strong>

                    <p>
                      {image
                        ? (
                            image.size /
                            (1024 * 1024)
                          ).toFixed(2)
                        : "0"} MB
                    </p>
                  </div>

                  <label
                    htmlFor="image"
                    className="change-image-button"
                  >
                    Change Image
                  </label>
                </div>

              </div>
            )}

          </div>

          {/* Image Error */}
          {imageError && (
            <p className="event-image-error">
              {imageError}
            </p>
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
              disabled={
                loading ||
                committeeLoading ||
                committees.length === 0
              }
            >
              {loading
                ? "Creating Event..."
                : "Create Event →"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default EventCreate;
