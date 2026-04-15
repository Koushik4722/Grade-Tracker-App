import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📊</span>
          <span style={styles.logoText}>GradeTracker</span>
        </div>

        <h1 style={styles.heading}>Create account</h1>
        <p style={styles.sub}>Start tracking your academic performance</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? <span style={styles.spinner} /> : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "radial-gradient(ellipse at 40% 80%, #1a1f35 0%, #0d0f14 70%)",
  },
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
  },
  logo: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" },
  logoIcon: { fontSize: "28px" },
  logoText: { fontSize: "20px", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.3px" },
  heading: { fontSize: "26px", fontWeight: 700, color: "var(--text)", marginBottom: "6px", letterSpacing: "-0.5px" },
  sub: { color: "var(--text2)", marginBottom: "28px", fontSize: "14px" },
  error: {
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.3)",
    color: "var(--danger)",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  successBox: {
    background: "rgba(52,211,153,0.12)",
    border: "1px solid rgba(52,211,153,0.3)",
    color: "var(--success)",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: 500, color: "var(--text2)" },
  input: {
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "var(--text)",
    fontSize: "15px",
  },
  btn: {
    background: "var(--accent)",
    color: "#fff",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "15px",
    fontWeight: 600,
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "46px",
  },
  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  footer: { textAlign: "center", marginTop: "24px", color: "var(--text2)", fontSize: "14px" },
  link: { color: "var(--accent)", fontWeight: 600 },
};
