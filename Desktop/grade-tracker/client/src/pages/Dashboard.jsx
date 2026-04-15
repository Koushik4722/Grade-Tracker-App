import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import API from "../api/axios";

const GRADE_COLORS = {
    "A+": "#34d399", A: "#34d399", "B+": "#6c8fff", B: "#6c8fff",
    "C+": "#fbbf24", C: "#fbbf24", D: "#fb923c", F: "#f87171",
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    const fetchData = async () => {
        try {
            const [gradesRes, statsRes] = await Promise.all([
                API.get("/grades"),
                API.get("/grades/stats"),
            ]);
            setGrades(gradesRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this grade entry?")) return;
        setDeleting(id);
        try {
            await API.delete(`/grades/${id}`);
            setGrades((prev) => prev.filter((g) => g._id !== id));
            const statsRes = await API.get("/grades/stats");
            setStats(statsRes.data);
        } catch (err) {
            alert("Failed to delete.");
        } finally {
            setDeleting(null);
        }
    };

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <div style={styles.page}>
            {/* Navbar */}
            <nav style={styles.nav}>
                <div style={styles.navLeft}>
                    <span style={styles.navIcon}>📊</span>
                    <span style={styles.navBrand}>GradeTracker</span>
                </div>
                <div style={styles.navRight}>
                    <span style={styles.navUser}>👋 {user?.name}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </nav>

            <div style={styles.content}>
                {/* Header */}
                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>My Grades</h1>
                        <p style={styles.pageSub}>Track and manage your academic performance</p>
                    </div>
                    <button style={styles.addBtn} onClick={() => navigate("/grades/add")}>
                        + Add Grade
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div style={styles.statsGrid} className="fade-in">
                        <StatCard label="Total Subjects" value={stats.total} icon="📚" color="#6c8fff" />
                        <StatCard label="Average Score" value={`${stats.average}%`} icon="📈" color="#a78bfa" />
                        <StatCard label="Highest Score" value={`${stats.highest}%`} icon="🏆" color="#34d399" />
                        <StatCard label="GPA (4.0 scale)" value={stats.gpa} icon="⭐" color="#fbbf24" />
                    </div>
                )}

                {/* Grades Table */}
                <div style={styles.tableCard} className="fade-in">
                    <div style={styles.tableHeader}>
                        <h2 style={styles.tableTitle}>All Entries</h2>
                        <span style={styles.tableCount}>{grades.length} records</span>
                    </div>

                    {loading ? (
                        <div style={styles.centerMsg}>
                            <span style={styles.spinnerLg} />
                        </div>
                    ) : grades.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>🎓</div>
                            <p style={styles.emptyText}>No grades yet</p>
                            <p style={styles.emptySub}>Click "Add Grade" to add your first entry</p>
                            <button style={styles.addBtn} onClick={() => navigate("/grades/add")}>
                                + Add Your First Grade
                            </button>
                        </div>
                    ) : (
                        <div style={styles.tableWrap}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {["Subject", "Semester", "Score", "Grade", "Remarks", "Actions"].map((h) => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {grades.map((g, i) => (
                                        <tr
                                            key={g._id}
                                            style={{ ...styles.tr, animationDelay: `${i * 0.04}s` }}
                                            className="fade-in"
                                        >
                                            <td style={styles.td}>
                                                <span style={styles.subjectText}>{g.subject}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.semesterBadge}>{g.semester}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.scoreText}>{g.score}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <span
                                                    style={{
                                                        ...styles.gradeBadge,
                                                        color: GRADE_COLORS[g.grade] || "#9099b0",
                                                        background: `${GRADE_COLORS[g.grade]}18` || "rgba(144,153,176,0.1)",
                                                        border: `1px solid ${GRADE_COLORS[g.grade]}40` || "1px solid rgba(144,153,176,0.2)",
                                                    }}
                                                >
                                                    {g.grade}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.remarks}>{g.remarks || "—"}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actions}>
                                                    <button
                                                        style={styles.editBtn}
                                                        onClick={() => navigate(`/grades/edit/${g._id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        style={styles.deleteBtn}
                                                        onClick={() => handleDelete(g._id)}
                                                        disabled={deleting === g._id}
                                                    >
                                                        {deleting === g._id ? "..." : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div style={{ ...styles.statCard, borderColor: `${color}30` }}>
            <div style={{ ...styles.statIconWrap, background: `${color}15` }}>
                <span style={styles.statIcon}>{icon}</span>
            </div>
            <div>
                <div style={{ ...styles.statValue, color }}>{value}</div>
                <div style={styles.statLabel}>{label}</div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", background: "var(--bg)" },
    nav: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: "64px",
        background: "var(--card)", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 10,
    },
    navLeft: { display: "flex", alignItems: "center", gap: "10px" },
    navIcon: { fontSize: "22px" },
    navBrand: { fontSize: "18px", fontWeight: 700, color: "var(--accent)" },
    navRight: { display: "flex", alignItems: "center", gap: "16px" },
    navUser: { color: "var(--text2)", fontSize: "14px" },
    logoutBtn: {
        background: "transparent", border: "1px solid var(--border)",
        color: "var(--text2)", borderRadius: "8px", padding: "7px 14px",
        fontSize: "13px", fontWeight: 500, transition: "all 0.2s",
    },
    content: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
    pageHeader: {
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: "28px", flexWrap: "wrap", gap: "16px",
    },
    pageTitle: { fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "4px" },
    pageSub: { color: "var(--text2)", fontSize: "14px" },
    addBtn: {
        background: "var(--accent)", color: "#fff", borderRadius: "10px",
        padding: "11px 20px", fontSize: "14px", fontWeight: 600,
        transition: "opacity 0.2s",
    },
    statsGrid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "16px", marginBottom: "28px",
    },
    statCard: {
        background: "var(--card)", border: "1px solid", borderRadius: "14px",
        padding: "20px", display: "flex", alignItems: "center", gap: "16px",
    },
    statIconWrap: {
        width: "46px", height: "46px", borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    statIcon: { fontSize: "20px" },
    statValue: { fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px" },
    statLabel: { fontSize: "12px", color: "var(--text2)", marginTop: "2px" },
    tableCard: {
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "16px", overflow: "hidden",
    },
    tableHeader: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px", borderBottom: "1px solid var(--border)",
    },
    tableTitle: { fontSize: "16px", fontWeight: 600 },
    tableCount: {
        background: "var(--bg3)", color: "var(--text2)",
        borderRadius: "20px", padding: "4px 12px", fontSize: "12px",
    },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
        padding: "12px 20px", textAlign: "left",
        fontSize: "12px", fontWeight: 600, color: "var(--text3)",
        textTransform: "uppercase", letterSpacing: "0.5px",
        background: "var(--bg3)", borderBottom: "1px solid var(--border)",
    },
    tr: { borderBottom: "1px solid var(--border)", transition: "background 0.15s" },
    td: { padding: "14px 20px", verticalAlign: "middle" },
    subjectText: { fontWeight: 600, color: "var(--text)" },
    semesterBadge: {
        background: "var(--bg3)", color: "var(--text2)",
        borderRadius: "6px", padding: "3px 10px", fontSize: "12px",
    },
    scoreText: {
        fontFamily: "var(--mono)", fontSize: "15px",
        fontWeight: 500, color: "var(--text)",
    },
    gradeBadge: {
        borderRadius: "6px", padding: "3px 10px",
        fontSize: "13px", fontWeight: 700, fontFamily: "var(--mono)",
    },
    remarks: { color: "var(--text2)", fontSize: "13px" },
    actions: { display: "flex", gap: "8px" },
    editBtn: {
        background: "rgba(108,143,255,0.12)", color: "var(--accent)",
        border: "1px solid rgba(108,143,255,0.25)", borderRadius: "7px",
        padding: "6px 14px", fontSize: "13px", fontWeight: 500,
    },
    deleteBtn: {
        background: "rgba(248,113,113,0.1)", color: "var(--danger)",
        border: "1px solid rgba(248,113,113,0.25)", borderRadius: "7px",
        padding: "6px 14px", fontSize: "13px", fontWeight: 500,
    },
    centerMsg: {
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "60px",
    },
    spinnerLg: {
        width: "28px", height: "28px",
        border: "3px solid var(--border)", borderTopColor: "var(--accent)",
        borderRadius: "50%", display: "inline-block",
        animation: "spin 0.7s linear infinite",
    },
    emptyState: {
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "60px 24px", gap: "10px",
    },
    emptyIcon: { fontSize: "48px", marginBottom: "8px" },
    emptyText: { fontSize: "18px", fontWeight: 600, color: "var(--text)" },
    emptySub: { color: "var(--text2)", fontSize: "14px", marginBottom: "16px" },
};
