import { useTheme } from "../theme/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="secondary-button"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
    >
      {theme === "light" ? "Dark mode" : "Light mode"}
    </button>
  );
}
