import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

const SEMESTERS = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4",
  "Semester 5", "Semester 6", "Semester 7", "Semester 8",
];

export default function GradeForm() {
  const { id } = useParams(); // exists only on edit
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: "", score: "", semester: "Semester 1", remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null); // live grade preview

  // Load existing grade if editing
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const { data } = await API.get(`/grades/${id}`);
        setForm({
          subject: data.subject,
          score: data.score,
          semester: data.semester,
          remarks: data.remarks || "",
        });
        setPreview(data.grade);
      } catch {
        setError("Could not load grade.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  // Live grade preview as user types score
  useEffect(() => {
    const s = Number(form.score);
    if (form.score === "" || isNaN(s)) { setPreview(null); return; }
    if (s >= 95) setPreview("A+");
    else if (s >= 90) setPreview("A");
    else if (s >= 85) setPreview("B+");
    else if (s >= 80) setPreview("B");
    else if (s >= 75) setPreview("C+");
    else if (s >= 70) setPreview("C");
    else if (s >= 60) setPreview("D");
    else setPreview("F");
  }, [form.score]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const score = Number(form.score);
    if (isNaN(score) || score < 0 || score > 100) {
      return setError("Score must be a number between 0 and 100.");
    }
    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/grades/${id}`, { ...form, score });
      } else {
        await API.post("/grades", { ...form, score });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save grade.");
    } finally {
      setLoading(false);
    }
  };

  const GRADE_COLOR = {
    "A+": "#34d399", A: "#34d399", "B+": "#6c8fff", B: "#6c8fff",
    "C+": "#fbbf24", C: "#fbbf24", D: "#fb923c", F: "#f87171",
  };

  if (fetching) {
    return (
      <div style={styles.page}>
        <div style={styles.center}><span style={styles.spinnerLg} /></div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        {/* Back button */}
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        <div style={styles.header}>
          <h1 style={styles.heading}>
            {isEdit ? "Edit Grade" : "Add New Grade"}
          </h1>
          <p style={styles.sub}>
            {isEdit ? "Update the details below" : "Fill in your subject details"}
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Subject */}
          <div style={styles.field}>
            <label style={styles.label}>Subject Name</label>
            <input
              style={styles.input}
              type="text"
              name="subject"
              placeholder="e.g. Mathematics, Physics..."
              value={form.subject}
              onChange={handleChange}
              required
            />
          </div>

          {/* Score + live preview side by side */}
          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Score (0 – 100)</label>
              <input
                style={styles.input}
                type="number"
                name="score"
                placeholder="e.g. 85"
                value={form.score}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>

            {/* Grade Preview */}
            <div style={styles.previewBox}>
              <span style={styles.previewLabel}>Grade</span>
              <span
                style={{
                  ...styles.previewValue,
                  color: preview ? GRADE_COLOR[preview] : "var(--text3)",
                }}
              >
                {preview || "—"}
              </span>
            </div>
          </div>

          {/* Semester */}
          <div style={styles.field}>
            <label style={styles.label}>Semester</label>
            <select
              style={styles.input}
              name="semester"
              value={form.semester}
              onChange={handleChange}
              required
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div style={styles.field}>
            <label style={styles.label}>Remarks (optional)</label>
            <input
              style={styles.input}
              type="text"
              name="remarks"
              placeholder="e.g. Final exam, Lab practical..."
              value={form.remarks}
              onChange={handleChange}
            />
          </div>

          {/* Grade Scale Reference */}
          <div style={styles.scaleBox}>
            <span style={styles.scaleTitle}>Grade Scale</span>
            <div style={styles.scaleGrid}>
              {[
                ["A+", "95–100", "#34d399"],
                ["A",  "90–94",  "#34d399"],
                ["B+", "85–89",  "#6c8fff"],
                ["B",  "80–84",  "#6c8fff"],
                ["C+", "75–79",  "#fbbf24"],
                ["C",  "70–74",  "#fbbf24"],
                ["D",  "60–69",  "#fb923c"],
                ["F",  "0–59",   "#f87171"],
              ].map(([g, range, c]) => (
                <div key={g} style={styles.scaleItem}>
                  <span style={{ ...styles.scaleBadge, color: c, background: `${c}18`, border: `1px solid ${c}40` }}>
                    {g}
                  </span>
                  <span style={styles.scaleRange}>{range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={styles.btnRow}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? (
                <span style={styles.spinner} />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Grade"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at 50% 0%, #1a1f35 0%, #0d0f14 60%)",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "32px 24px",
  },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" },
  spinnerLg: {
    width: "28px", height: "28px",
    border: "3px solid var(--border)", borderTopColor: "var(--accent)",
    borderRadius: "50%", display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  card: {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "20px", padding: "36px 40px",
    width: "100%", maxWidth: "540px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
  },
  backBtn: {
    background: "transparent", border: "none",
    color: "var(--text2)", fontSize: "13px",
    cursor: "pointer", marginBottom: "24px", padding: 0,
    display: "flex", alignItems: "center", gap: "4px",
    transition: "color 0.2s",
  },
  header: { marginBottom: "28px" },
  heading: { fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "6px" },
  sub: { color: "var(--text2)", fontSize: "14px" },
  error: {
    background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)",
    color: "var(--danger)", borderRadius: "10px",
    padding: "12px 16px", marginBottom: "20px", fontSize: "14px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: 500, color: "var(--text2)" },
  input: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: "10px", padding: "12px 14px",
    color: "var(--text)", fontSize: "15px", width: "100%",
    transition: "border-color 0.2s",
  },
  row: { display: "flex", gap: "14px", alignItems: "flex-end" },
  previewBox: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: "10px", padding: "12px 20px",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "4px", minWidth: "80px",
  },
  previewLabel: { fontSize: "11px", color: "var(--text3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" },
  previewValue: { fontSize: "26px", fontWeight: 700, fontFamily: "var(--mono)", transition: "color 0.3s" },
  scaleBox: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "16px",
  },
  scaleTitle: { fontSize: "12px", color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "12px" },
  scaleGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" },
  scaleItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  scaleBadge: {
    borderRadius: "6px", padding: "3px 10px",
    fontSize: "13px", fontWeight: 700, fontFamily: "var(--mono)",
  },
  scaleRange: { fontSize: "11px", color: "var(--text3)" },
  btnRow: { display: "flex", gap: "12px", marginTop: "4px" },
  cancelBtn: {
    flex: 1, background: "var(--bg3)", border: "1px solid var(--border)",
    color: "var(--text2)", borderRadius: "10px", padding: "13px",
    fontSize: "14px", fontWeight: 500,
  },
  submitBtn: {
    flex: 2, background: "var(--accent)", color: "#fff",
    borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center", minHeight: "46px",
  },
  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
    borderRadius: "50%", display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
};
