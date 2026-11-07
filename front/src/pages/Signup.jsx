import React, { useState } from "react";
import ApiClient from "../apiClient/Interceptor.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

const Signup = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, role } = formData;

    // Validation
    if (!name || !email || !password || !role) {
      toast.warning("All fields are required");
      return;
    }

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await ApiClient.post("/user/signup", formData);

      console.log("Signup successful", response.data);

      const registeredUser = response.data.user;

      if (registeredUser) {
        signin(registeredUser);

        toast.success("Account created successfully!");

        if (registeredUser.role === "organizer") {
          navigate("/org-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      } else {
        toast.success("Account created successfully. Please sign in.");
        navigate("/signin");
      }

    } catch (error) {
      console.log(
        "Signup failure",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">

        <div className="signup-heading">
          <h1>Create Account</h1>
          <p>Join our CampusConnect</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">

          <div className="signup-field">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      id="password"
      name="password"
      placeholder="Create a password"
      value={formData.password}
      onChange={handleChange}
      autoComplete="new-password"
      minLength={6}
      required
    />

    <IconButton
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <VisibilityOff /> : <Visibility />}
    </IconButton>
  </div>

            <small>Minimum 6 characters</small>
          </div>

          <div className="signup-field">
            <label htmlFor="role">Register As</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>

        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <Link to="/signin">Sign In</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;