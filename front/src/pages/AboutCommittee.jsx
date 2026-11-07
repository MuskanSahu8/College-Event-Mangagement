import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import "../style/Org.css";
import "../style/org-orange-theme.css";

const AboutCommittee = () => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await ApiClient.get("/committee/");

        setCommittees(response.data.committees || []);
      } catch (err) {
        console.error("Error fetching committees:", err);
        setError(
          err.response?.data?.message || "Failed to fetch committees."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
  }, []);

  return (
    <div className="org-dashboard">
      <div className="org-committee-section">
        <h2>About Committees</h2>
        <p>View the committees responsible for organizing college events.</p>

        {loading && <p>Loading committees...</p>}

        {!loading && error && (
          <p className="org-error">{error}</p>
        )}

        {!loading && !error && committees.length === 0 && (
          <p>No committees found. Create your first committee to get started.</p>
        )}

        {!loading && !error && committees.length > 0 && (
          <div className="org-committees-grid">
            {committees.map((committee) => (
              <div className="org-committee-card" key={committee._id}>
                <h3>{committee.name}</h3>
                <p>
                  {committee.description || "No description available."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutCommittee;