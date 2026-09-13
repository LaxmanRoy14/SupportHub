import { useState } from "react";

export function CommentForm({ onSubmit, submitting, submitError, submitSuccess }) {
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmit(message.trim());
    setMessage("");
  }

  return (
    <div className="card" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Add Comment</h3>
      {submitError && <div className="error-banner"><p>{submitError}</p></div>}
      {submitSuccess && <div className="form-success"><p>{submitSuccess}</p></div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.75rem" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={3}
            disabled={submitting}
            required
          />
        </div>
        <div>
          <button type="submit" disabled={submitting || !message.trim()}>
            {submitting ? "Posting Comment..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
