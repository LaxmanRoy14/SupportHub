import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { apiClient } from "../api/client";
import { getApiErrorMessage } from "../api/errorMessage";
import { setAccessToken, setAuthLoading, setCredentials } from "../features/auth/authSlice";
import { roleHomePath } from "../routing/access";
import { ThemeToggle } from "../components/ThemeToggle";

export function LoginPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    dispatch(setAuthLoading(true));

    try {
      const loginResponse = await apiClient.post("/api/auth/login", { email, password });
      const accessToken = loginResponse.data.access_token;
      dispatch(setAccessToken(accessToken));
      const userResponse = await apiClient.get("/api/auth/me");

      dispatch(setCredentials({ user: userResponse.data, accessToken }));
      navigate(roleHomePath(userResponse.data), { replace: true });
    } catch (requestError) {
      dispatch(setAuthLoading(false));
      setError(getApiErrorMessage(requestError, "Login could not be completed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page"><div className="auth-theme-toggle"><ThemeToggle /></div>
      <section className="auth-card">
        <h1>Log in to SupportHub</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p><Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
