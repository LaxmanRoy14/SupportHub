export function AgentCard({ agent, assignedToId }) {
  if (!agent && !assignedToId) {
    return (
      <div className="agent-card">
        <div className="agent-avatar">?</div>
        <div>
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Unassigned</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Automatically assigned when an agent becomes available.
          </div>
        </div>
      </div>
    );
  }

  const name = agent?.name || `Agent #${assignedToId}`;
  const role = agent?.role || "Support Agent";
  const email = agent?.email || null;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="agent-card">
      <div className="agent-avatar">{initial}</div>
      <div>
        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{name}</div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {role} {email ? `• ${email}` : ""}
        </div>
      </div>
    </div>
  );
}
