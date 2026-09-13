import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../api/client.js";
import { getApiErrorMessage } from "../api/errorMessage.js";
import { AppShell } from "../components/AppShell";

export function CreateTicketPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const response = await apiClient.get("/api/categories");
      const list = response.data || [];
      setCategories(list);
      if (list.length > 0) {
        setCategoryId(String(list[0].id));
      }
    } catch (err) {
      setCategoriesError(getApiErrorMessage(err, "Failed to load categories. Please try again."));
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    const parsedCategory = parseInt(categoryId, 10);
    if (isNaN(parsedCategory) || parsedCategory <= 0) {
      setError("Please select a valid category.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: parsedCategory,
        priority: priority,
      };

      const response = await apiClient.post("/api/tickets", payload);
      const newTicket = response.data;

      navigate(`/customer/tickets/${newTicket.id}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create ticket. Please check your inputs."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell><main className="page-container form-page">
      <div className="page-header">
        <div>
          <h1>Create Support Ticket</h1>
          <p>Submit a new issue or request to our support team.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="secondary-button" onClick={() => navigate("/customer")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: "1rem" }}>
          <p>{error}</p>
        </div>
      )}

      {categoriesError && (
        <div className="error-banner" style={{ marginBottom: "1rem" }}>
          <p>{categoriesError}</p>
          <button type="button" className="secondary-button" onClick={fetchCategories} style={{ marginTop: "0.5rem" }}>
            Retry Loading Categories
          </button>
        </div>
      )}

      <form className="card ticket-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of the issue"
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed explanation of what happened or what you need..."
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={categoriesLoading || categories.length === 0}
            required
          >
            {categoriesLoading ? (
              <option value="">Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="form-actions"><button type="button" className="secondary-button" onClick={() => navigate("/customer/tickets")}>Cancel</button><button type="submit" disabled={submitting || categoriesLoading || !categoryId}>
          {submitting ? "Creating Ticket..." : "Submit Ticket"}
        </button></div>
      </form>
    </main></AppShell>
  );
}
