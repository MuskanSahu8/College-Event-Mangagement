
import React, { useState } from "react";
import { toast } from "react-toastify";
import ApiClient from "../apiClient/Interceptor";
import { useNavigate, useParams } from "react-router-dom";
import "../style/RegisterEvent.css";

const RegisterEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    className: "",
    universityRollno: "",
    email: "",
    phone: "",
    dept: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const registerHandle = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const response = await ApiClient.post(
      `/register/register/${id}`,
      formData
    );

    console.log("Registration:", response.data);

    toast.success("Registered successfully!");

    setFormData({
      name: "",
      className: "",
      universityRollno: "",
      email: "",
      phone: "",
      dept: "",
    });

    // Navigate after showing success toast
    setTimeout(() => {
      navigate("/");
    }, 1500);

  } catch (error) {
    console.error(
      "Registration error:",
      error.response?.data?.message || error.message
    );

    const errorMessage =
      error.response?.data?.message ||
      "Registration failed. Please try again.";

    toast.error(errorMessage);

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="register-page">

      {/* HEADER */}
      <div className="register-hero">
        <div>
          <span className="register-tag">
            STUDENT EVENT PORTAL
          </span>

          <h1>Event Registration 📝</h1>

          <p>
            You're one step closer to an exciting experience!
            Fill in your details to register for this event.
          </p>
        </div>

        <div className="register-hero-icon">🎓</div>
      </div>

      {/* REGISTRATION FORM */}
      <div className="register-form-container">

        <div className="register-form-heading">
          <div className="register-form-icon">📋</div>

          <div>
            <h2>Student Information</h2>
            <p>Please provide your correct details below.</p>
          </div>
        </div>

        <form onSubmit={registerHandle}>

          <div className="register-form-grid">

            {/* NAME */}
            <div className="register-input-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* CLASS */}
            <div className="register-input-group">
              <label htmlFor="className">Class *</label>
              <input
                id="className"
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                placeholder="e.g. B.Tech 4th Year"
                required
              />
            </div>

            {/* ROLL NUMBER */}
            <div className="register-input-group">
              <label htmlFor="universityRollno">
                University Roll Number *
              </label>
              <input
                id="universityRollno"
                type="text"
                name="universityRollno"
                value={formData.universityRollno}
                onChange={handleChange}
                placeholder="Enter your roll number"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="register-input-group">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* PHONE */}
            <div className="register-input-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                pattern="[0-9]{10}"
                title="Enter a valid 10-digit phone number"
                maxLength={10}
                required
              />
            </div>

            {/* DEPARTMENT */}
            <div className="register-input-group">
              <label htmlFor="dept">Department *</label>
              <input
                id="dept"
                type="text"
                name="dept"
                value={formData.dept}
                onChange={handleChange}
                placeholder="Enter your department"
                required
              />
            </div>

          </div>

          <div className="register-note">
            <span>🔒</span>
            <p>
              Please ensure all information is correct before
              submitting your registration.
            </p>
          </div>

          <div className="register-form-actions">

            <button
              type="button"
              className="register-cancel-btn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? "Registering..." : "Complete Registration →"}
            </button>

          </div>

        </form>
      </div>

    </div>
  );
};

export default RegisterEvent;
