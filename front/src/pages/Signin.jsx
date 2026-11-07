
import React, { useState } from "react";
import { toast } from "react-toastify";
import ApiClient from "../apiClient/Interceptor.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

const Signin = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    const { email, password } = formData;

    if (!email || !password) {
      toast.warning("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const response = await ApiClient.post(
        "/user/signin",
        formData
      );

      const loggedInUser = response.data.user;

      if (!loggedInUser) {
        toast.error("User information was not returned by the server");
        return;
      }

      // Update authentication context
      signin(loggedInUser);

      // Success notification
      toast.success("Signin successful! Welcome back.");

      // Role-based navigation
      if (loggedInUser.role === "organizer") {
        navigate("/org-dashboard", { replace: true });
      } else if (loggedInUser.role === "student") {
        navigate("/student-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (error) {
      console.error(
        "Signin error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        "Invalid email or password. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="signin-page">
      <div className="signin-card">

        <div className="signin-heading">
          <h1>Welcome Back!</h1>
          <p>Sign in to your CampusConnect account</p>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">

          <div className="signin-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="signin-field">
            <label htmlFor="password">Password</label>
             <div className="password-input-wrapper">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="Enter your password"
      value={formData.password}
      onChange={handleChange}
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
          </div>

          <button
            type="submit"
            className="signin-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

        </form>

        <div className="signin-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup">Create Account</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signin;
