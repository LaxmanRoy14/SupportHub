export function CommentList({ comments, loading, error }) {
  if (error) {
    return (
      <div className="error-banner">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-state">
        <p>Loading comments timeline...</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "2rem 1rem" }}>
        <h3>No comments yet</h3>
        <p>No activity has been recorded on this ticket yet.</p>
      </div>
    );
  }

  return (
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
  );
}
