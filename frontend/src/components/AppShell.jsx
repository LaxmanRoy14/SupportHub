import { useState } from "react";
import { useSelector } from "react-redux";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children, showSidebar = true }) {
  const { accessToken } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar isSidebarOpen={isSidebarOpen} onMenuToggle={() => setIsSidebarOpen((open) => !open)} />
      <div className="app-body">
        {showSidebar && accessToken && <><button className={`sidebar-backdrop ${isSidebarOpen ? "visible" : ""}`} aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} /><Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /></>}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
