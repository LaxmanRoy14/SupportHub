import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiClient } from "../api/client";
import { getApiErrorMessage } from "../api/errorMessage";
import { ThemeToggle } from "../components/ThemeToggle";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await apiClient.post("/api/auth/register", form);
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Registration could not be completed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page"><div className="auth-theme-toggle"><ThemeToggle /></div>
      <section className="auth-card">
        <h1>Create your SupportHub account</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={updateField} required />

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={updateField} required />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            minLength="8"
            value={form.password}
            onChange={updateField}
            required
          />

          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>
        <p>Already registered? <Link to="/login">Log in</Link></p>
      </section>
    </main>
  );
}
