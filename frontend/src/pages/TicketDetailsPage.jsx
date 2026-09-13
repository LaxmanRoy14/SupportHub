import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiClient } from "../api/client.js";
import { getApiErrorMessage } from "../api/errorMessage.js";

export function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [updating, setUpdating] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSubmitError, setCommentSubmitError] = useState(null);
  const [commentSubmitSuccess, setCommentSubmitSuccess] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  async function fetchInitialData() {
    try {
      setLoading(true);
      setError(null);
      setCommentsLoading(true);
      setCommentsError(null);

      const [ticketRes, categoriesRes, commentsRes] = await Promise.all([
        apiClient.get(`/api/tickets/${id}`),
        apiClient.get("/api/categories").catch(() => ({ data: [] })),
        apiClient.get(`/api/tickets/${id}/comments`).catch((err) => {
          setCommentsError(getApiErrorMessage(err, "Failed to load comments."));
          return { data: [] };
        }),
      ]);

      const ticketData = ticketRes.data;
      setTicket(ticketData);
      setCategories(categoriesRes.data || []);
      setComments(commentsRes.data || []);
      populateEditForm(ticketData);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load ticket details."));
    } finally {
      setLoading(false);
      setCommentsLoading(false);
    }
  }

  function populateEditForm(data) {
    setEditTitle(data.title || "");
    setEditDescription(data.description || "");
    setEditCategoryId(data.category_id ? String(data.category_id) : "1");
    setEditPriority(data.priority || "MEDIUM");
  }

  function handleStartEdit() {
    if (ticket) {
      populateEditForm(ticket);
    }
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    if (ticket) {
      populateEditForm(ticket);
    }
    setError(null);
  }

  async function handleUpdateSubmit(e) {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim()) {
      setError("Title and description cannot be empty.");
      return;
    }

    const parsedCategory = parseInt(editCategoryId, 10);
    if (isNaN(parsedCategory) || parsedCategory <= 0) {
      setError("Please select a valid category.");
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category_id: parsedCategory,
        priority: editPriority,
      };

      const response = await apiClient.put(`/api/tickets/${id}`, payload);
      const updatedTicket = response.data;

      setTicket(updatedTicket);
      setIsEditing(false);
      setSuccessMsg("Ticket updated successfully!");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update ticket."));
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteTicket() {
    try {
      setDeleting(true);
      setError(null);
      await apiClient.delete(`/api/tickets/${id}`);
      navigate("/customer", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete ticket."));
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    const trimmedMessage = newComment.trim();
    if (!trimmedMessage) {
      setCommentSubmitError("Comment message cannot be empty.");
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentSubmitError(null);
      setCommentSubmitSuccess(null);

      const response = await apiClient.post(`/api/tickets/${id}/comments`, {
        message: trimmedMessage,
      });

      const addedComment = response.data;
      setComments((prev) => [...prev, addedComment]);
      setNewComment("");
      setCommentSubmitSuccess("Comment added successfully!");
    } catch (err) {
      setCommentSubmitError(getApiErrorMessage(err, "Failed to submit comment."));
    } finally {
      setSubmittingComment(false);
    }
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

  if (loading) {
    return (
      <main className="page-container">
        <div className="loading-state">
          <p>Loading ticket details...</p>
        </div>
      </main>
    );
  }

  if (error && !ticket) {
    return (
      <main className="page-container">
        <div className="page-header">
          <h1>Ticket Details</h1>
          <button type="button" className="secondary-button" onClick={() => navigate("/customer")}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="error-banner">
          <p>{error}</p>
          <button type="button" className="secondary-button" onClick={fetchInitialData} style={{ marginTop: "0.5rem" }}>
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1>Ticket #{ticket.id}</h1>
          <p>View and manage your support ticket details.</p>
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

      {successMsg && (
        <div className="form-success" style={{ marginBottom: "1rem" }}>
          <p>{successMsg}</p>
        </div>
      )}

      {isEditing ? (
        <div className="detail-card">
          <h2>Edit Ticket</h2>
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <label htmlFor="edit-title">Title *</label>
              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">Description *</label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-category">Category *</label>
              <select
                id="edit-category"
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                required
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value={editCategoryId}>Category #{editCategoryId}</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-priority">Priority *</label>
              <select
                id="edit-priority"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <div>{renderStatusBadge(ticket.status)}</div>
              <span className="read-only-note">Status is controlled by support workflow and cannot be changed here.</span>
            </div>

            <div className="form-group">
              <label>Assigned Agent</label>
              <div style={{ fontSize: "0.95rem", color: "#374151" }}>
                {ticket.assigned_to ? `Agent #${ticket.assigned_to}` : "Unassigned"}
              </div>
              <span className="read-only-note">Agent assignment is managed automatically by the system.</span>
            </div>

            <div className="actions-row">
              <button type="submit" disabled={updating}>
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>
              <button type="button" className="secondary-button" onClick={handleCancelEdit} disabled={updating}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="detail-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{ticket.title}</h2>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {renderPriorityBadge(ticket.priority)}
              {renderStatusBadge(ticket.status)}
            </div>
          </div>

          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Ticket ID</span>
              <span className="meta-value">#{ticket.id}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Category</span>
              <span className="meta-value">{getCategoryName(ticket.category_id)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Status</span>
              <span className="meta-value">{ticket.status}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Assigned To</span>
              <span className="meta-value">
                {ticket.assigned_to ? `Agent #${ticket.assigned_to}` : "Unassigned"}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Created At</span>
              <span className="meta-value">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Last Updated</span>
              <span className="meta-value">{new Date(ticket.updated_at).toLocaleString()}</span>
            </div>
            {ticket.resolved_at && (
              <div className="meta-item">
                <span className="meta-label">Resolved At</span>
                <span className="meta-value">{new Date(ticket.resolved_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <h3 style={{ fontSize: "1rem", color: "#374151", marginBottom: "0.5rem" }}>Description</h3>
            <p style={{ whiteSpace: "pre-wrap", color: "#1f2937", lineHeight: "1.5" }}>{ticket.description}</p>
          </div>

          <div className="actions-row">
            <button type="button" onClick={handleStartEdit}>
              Edit Ticket
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Ticket
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="confirm-box">
              <p>Are you sure you want to delete this ticket? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleDeleteTicket}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Ticket"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="comments-section">
        <h2 className="comments-header">Comments ({comments.length})</h2>

        {commentsError && (
          <div className="error-banner" style={{ marginBottom: "1rem" }}>
            <p>{commentsError}</p>
          </div>
        )}

        {commentsLoading ? (
          <div className="loading-state">
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="empty-state">
            <h3>No comments yet</h3>
            <p>Be the first to add a comment to this ticket.</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-card-header">
                  <span className="comment-author">User #{comment.user_id}</span>
                  <span className="comment-date">
                    {comment.created_at ? new Date(comment.created_at).toLocaleString() : ""}
                  </span>
                </div>
                <p className="comment-message">{comment.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        <div className="add-comment-card">
          <h3>Add Comment</h3>
          {commentSubmitError && (
            <div className="error-banner" style={{ marginBottom: "1rem" }}>
              <p>{commentSubmitError}</p>
            </div>
          )}
          {commentSubmitSuccess && (
            <div className="form-success" style={{ marginBottom: "1rem" }}>
              <p>{commentSubmitSuccess}</p>
            </div>
          )}
          <form onSubmit={handleCommentSubmit}>
            <div className="form-group">
              <label htmlFor="new-comment">Message *</label>
              <textarea
                id="new-comment"
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  if (commentSubmitError) setCommentSubmitError(null);
                  if (commentSubmitSuccess) setCommentSubmitSuccess(null);
                }}
                placeholder="Write your comment here..."
                rows={4}
                disabled={submittingComment}
                required
              />
            </div>
            <div className="actions-row">
              <button type="submit" disabled={submittingComment || !newComment.trim()}>
                {submittingComment ? "Submitting Comment..." : "Add Comment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

