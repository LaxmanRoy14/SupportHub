import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

export function TicketTable({ tickets, categories = [], basePath = "/customer/tickets" }) {
  function getCategoryName(catId) {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : `Category #${catId}`;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Tickets Found</h3>
        <p>There are no support tickets matching this view.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const agentDisplay = ticket.assigned_agent?.name
              ? ticket.assigned_agent.name
              : ticket.assigned_to
              ? `Agent #${ticket.assigned_to}`
              : "Unassigned";

            return (
              <tr key={ticket.id}>
                <td style={{ fontWeight: 600 }}>#{ticket.id}</td>
                <td style={{ fontWeight: 500 }}>
                  <Link to={`${basePath}/${ticket.id}`} style={{ color: "var(--text-primary)" }}>
                    {ticket.title}
                  </Link>
                </td>
                <td>{getCategoryName(ticket.category_id)}</td>
                <td><PriorityBadge priority={ticket.priority} /></td>
                <td><StatusBadge status={ticket.status} /></td>
                <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{agentDisplay}</td>
                <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td>
                  <Link
                    to={`${basePath}/${ticket.id}`}
                    className="secondary-button"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem", borderRadius: "4px" }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
