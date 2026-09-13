import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { ThemeToggle } from "./ThemeToggle";
import { roleHomePath } from "../routing/access";

export function Navbar({ onMenuToggle, isSidebarOpen = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, accessToken } = useSelector((state) => state.auth);
  const location = useLocation();
  const context = location.pathname.includes("agent") ? "Agent workspace" : location.pathname.includes("customer") ? "Customer workspace" : "Support that keeps teams moving";
  const logoDestination = accessToken && currentUser ? roleHomePath(currentUser) : "/";

  function handleLogout() {
    dispatch(logout());
    navigate("/", { replace: true });
  }

  return (
    <header className="app-header">
      {accessToken && <button type="button" className="menu-toggle" aria-label="Toggle navigation" aria-expanded={isSidebarOpen} onClick={onMenuToggle}>☰</button>}
      <Link to={logoDestination} className="app-logo" aria-label="SupportHub home">
        <span className="logo-mark">S</span> SupportHub
        {currentUser?.role && (
          <span className="app-logo-badge">
            {currentUser.role}
          </span>
        )}
      </Link>

      {accessToken && <span className="nav-context">{context}</span>}

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <ThemeToggle />

        {accessToken && currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              {currentUser.name || currentUser.email}
            </span>
            <button
              type="button"
              className="secondary-button"
              onClick={handleLogout}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
            >
              Log out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link to="/login" className="secondary-button" style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem", textDecoration: "none" }}>
              Sign In
            </Link>
            <Link to="/register" style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem", textDecoration: "none", color: "#ffffff", borderRadius: "6px" }}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
