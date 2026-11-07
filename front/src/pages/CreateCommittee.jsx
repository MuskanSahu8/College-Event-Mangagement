
import React, { useEffect, useState } from "react";
import ApiClient from "../apiClient/Interceptor";
import "../style/Org.css";

const CreateCommittee = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await ApiClient.get("/committee/");
      setCommittees(response.data.committees || []);
    } catch (err) {
      console.error("Fetch committees error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load committees."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Please enter a committee name.");
      return;
    }

    try {
      setCreating(true);

      const response = await ApiClient.post("/committee/create", {
        name: name.trim(),
        description: description.trim(),
      });

      setMessage(
        response.data.message || "Committee created successfully!"
      );

      setName("");
      setDescription("");

      // Refresh the committee list after creating one.
      await fetchCommittees();
    } catch (err) {
      console.error("Create committee error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create committee."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="org-dashboard">
      <div className="org-committee-section">
        <h2>Committee Management</h2>
        <p>Create committees and view existing committees.</p>

        <div className="committee-create-panel">
          <h3>Create New Committee</h3>

          <form
            className="committee-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="committeeName">
              Committee Name
            </label>

            <input
              id="committeeName"
              type="text"
              placeholder="e.g. Technical Committee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label htmlFor="committeeDescription">
              About Committee
            </label>

            <textarea
              id="committeeDescription"
              placeholder="Describe the committee and its responsibilities"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Committee"}
            </button>
          </form>

          {message && (
            <p className="committee-success" role="status">
              {message}
            </p>
          )}

          {error && (
            <p className="org-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="committee-list-panel">
          <h3>Existing Committees</h3>

          {loading && <p>Loading committees...</p>}

          {!loading && committees.length === 0 && !error && (
            <p>No committees found. Create your first committee.</p>
          )}

          {!loading && committees.length > 0 && (
            <div className="org-committees-grid">
              {committees.map((committee) => (
                <div
                  className="org-committee-card"
                  key={committee._id}
                >
                  <h4>{committee.name}</h4>
                  <p>
                    {committee.description ||
                      "No description available."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCommittee;
