import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

export function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const role = currentUser?.role;

  if (!role) return null;

  return (
    <aside className={`app-sidebar ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      {role === "CUSTOMER" && (
        <>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", padding: "0.4rem 0.9rem" }}>
            Customer Portal
          </div>
          <NavLink onClick={onClose} to="/customer" end className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink onClick={onClose} to="/customer/tickets" end className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            My Tickets
          </NavLink>
          <NavLink onClick={onClose} to="/customer/tickets/open" className="sidebar-nav-item">
            Open Tickets
          </NavLink>
          <NavLink onClick={onClose} to="/customer/tickets/closed" className="sidebar-nav-item">
            Closed Tickets
          </NavLink>
          <NavLink onClick={onClose} to="/customer/care" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            Customer Care
          </NavLink>
          <NavLink onClick={onClose} to="/customer/faq" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            FAQ
          </NavLink>
        </>
      )}

      {role === "AGENT" && (
        <>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", padding: "0.4rem 0.9rem" }}>
            Agent Portal
          </div>
          <NavLink onClick={onClose} to="/agent" end className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink onClick={onClose} to="/agent/tickets" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            My Tickets
          </NavLink>
          <NavLink onClick={onClose} to="/agent/queue" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            Queue
          </NavLink>
          <NavLink onClick={onClose} to="/agent/tickets/open" className="sidebar-nav-item">Open Tickets</NavLink>
          <NavLink onClick={onClose} to="/agent/tickets/pending" className="sidebar-nav-item">Pending Tickets</NavLink>
          <NavLink onClick={onClose} to="/agent/tickets/closed" className="sidebar-nav-item">Closed Tickets</NavLink>
          <NavLink onClick={onClose} to="/agent/performance" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            Performance
          </NavLink>
          <NavLink onClick={onClose} to="/agent/availability" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            Availability
          </NavLink>
          <NavLink onClick={onClose} to="/agent/faq" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            FAQ
          </NavLink>
        </>
      )}
      <button type="button" className="sidebar-nav-item sidebar-logout" onClick={() => { dispatch(logout()); onClose(); navigate("/", { replace: true }); }}>Log out</button>
    </aside>
  );
}
