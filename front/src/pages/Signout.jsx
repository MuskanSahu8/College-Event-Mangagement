import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const Signout = () => {
  const { signout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignout = async () => {
    try {
      setLoading(true);
      await signout();
      navigate("/signin");
    } catch (error) {
      console.error("Signout error:", error);
      alert("Unable to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signout-page">
      <div className="signout-card">
        <div className="signout-icon">
          <span>👋</span>
        </div>

        <h1>Leaving So Soon?</h1>

        <p>
          Are you sure you want to sign out of your CampusConnect?
        </p>

        <button
          className="signout-button"
          onClick={handleSignout}
          disabled={loading}
        >
          {loading ? "Signing Out..." : "Yes, Sign Out"}
        </button>

        <button
          className="signout-cancel"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>

        <small>Thank you for being part of our event community!</small>
      </div>
    </div>
  );
};

export default Signout;