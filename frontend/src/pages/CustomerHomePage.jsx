import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { apiClient } from "../api/client.js";
import { getApiErrorMessage } from "../api/errorMessage.js";
import { logout } from "../features/auth/authSlice.js";

export function CustomerHomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);
      const [ticketsRes, categoriesRes] = await Promise.all([
        apiClient.get("/api/tickets"),
        apiClient.get("/api/categories").catch(() => ({ data: [] })),
      ]);
      setTickets(ticketsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load tickets. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  function renderPriorityBadge(priority) {
    const p = (priority || "").toUpperCase();
    const className = p === "HIGH" ? "badge-high" : p === "LOW" ? "badge-low" : "badge-medium";
    return <span className={`badge ${className}`}>{p || "MEDIUM"}</span>;
  }

  function renderStatusBadge(status) {
    const s = (status || "").toUpperCase();
    const className = s === "RESOLVED" ? "badge-resolved" : s === "PENDING" ? "badge-pending" : "badge-open";
    return <span className={`badge ${className}`}>{s || "OPEN"}</span>;
  }

  function getCategoryName(catId) {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : `Category #${catId}`;
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1>Customer Dashboard</h1>
          <p>Welcome, {currentUser?.name || "Customer"}. Manage your support tickets here.</p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={() => navigate("/customer/tickets/new")}>
            + Create Ticket
          </button>
          <button type="button" className="secondary-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: "1rem" }}>
          <p>{error}</p>
          <button type="button" className="secondary-button" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <h3>No Tickets Found</h3>
          <p>You haven't submitted any support tickets yet.</p>
          <button type="button" onClick={() => navigate("/customer/tickets/new")}>
            Create Ticket Now
          </button>
        </div>
      ) : (
        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <Link key={ticket.id} to={`/customer/tickets/${ticket.id}`} className="ticket-card">
              <div className="ticket-card-header">
                <h3 className="ticket-card-title">{ticket.title}</h3>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {renderPriorityBadge(ticket.priority)}
                  {renderStatusBadge(ticket.status)}
                </div>
              </div>
              <p style={{ margin: "0.5rem 0", color: "#4b5563", fontSize: "0.95rem" }}>
                {ticket.description.length > 120
                  ? `${ticket.description.substring(0, 120)}...`
                  : ticket.description}
              </p>
              <div className="ticket-meta">
                <span>{getCategoryName(ticket.category_id)}</span>
                <span>•</span>
                <span>
                  {ticket.assigned_to ? `Assigned to Agent #${ticket.assigned_to}` : "Unassigned"}
                </span>
                <span>•</span>
                <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
