import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { apiClient } from "../api/client";
import { getApiErrorMessage } from "../api/errorMessage";
import { ThemeToggle } from "../components/ThemeToggle";

export function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    location.state?.email
      ? "OTP sent successfully. We sent a 6-digit verification code to your registered email address."
      : ""
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsVerifying(true);

    try {
      await apiClient.post("/api/auth/verify-otp", { email, otp });
      navigate("/login", { state: { email } });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "OTP verification failed."));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await apiClient.post("/api/auth/resend-otp", { email });
      setSuccess(response.data.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not resend the OTP."));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="auth-page"><div className="auth-theme-toggle"><ThemeToggle /></div>
      <section className="auth-card">
        <h1>Verify your email</h1>
        <form onSubmit={handleVerify}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label htmlFor="otp">Six-digit OTP</label>
          <input
            id="otp"
            inputMode="numeric"
            maxLength="6"
            minLength="6"
            pattern="[0-9]{6}"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            required
          />

          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          <button type="submit" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <button className="secondary-button" type="button" onClick={handleResend} disabled={!email || isResending}>
          {isResending ? "Resending..." : "Resend OTP"}
        </button>
        <p><Link to="/login">Back to login</Link></p>
      </section>
    </main>
  );
}
