import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, query,
  deleteDoc, doc, updateDoc, orderBy
} from "firebase/firestore";

// ─── DESIGN TOKENS (Tu estilo Lavanda Minimalista) ───────────────────────────
const C = {
  primary:       "#CBAAE3",
  primaryLight:  "#F3E8FF",
  primaryDark:   "#9F6DC2",
  accent:        "#818CF8",
  accentLight:   "#EEF2FF",
  success:       "#10B981",
  successLight:  "#D1FAE5",
  warning:       "#F59E0B",
  warningLight:  "#FEF3C7",
  danger:        "#EF4444",
  dangerLight:   "#FEE2E2",
  text:          "#1F2937",
  textSecondary: "#6B7280",
  textMuted:     "#9CA3AF",
  bgBody:        "#FAF5FF",
  bgCard:        "#FFFFFF",
  border:        "#E9D5FF",
  borderLight:   "#F3E8FF",
  white:         "#FFFFFF",
};

const PLATFORMS = {
  instagram: { name: "Instagram", color: "#E1306C", icon: "📸" },
  facebook:  { name: "Facebook",  color: "#1877F2", icon: "👥" },
};

const STATUS_MAP = {
  borrador:   { label: "Borrador",   bg: C.bgBody,       color: C.textSecondary },
  programado: { label: "Programado", bg: C.warningLight,  color: C.warning },
  publicado:  { label: "Publicado",  bg: C.successLight,  color: C.success },
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ─── COMPONENTES DE APOYO ───────────────────────────────────────────────────

const Card = ({ children, style }) => (
  <div style={{ background: C.bgCard, borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", ...style }}>
    {children}
  </div>
);

const Badge = ({ children, bg, color }) => (
  <span style={{ background: bg, color: color, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
    {children}
  </span>
);

// ─── VISTAS ESPECÍFICAS ─────────────────────────────────────────────────────

function CalendarView({ posts }) {
  const [currentDate] = useState(new Date());
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{MONTHS[month]} {year}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.textMuted, paddingBottom: 10 }}>{d}</div>)}
        {cells.map((day, i) => (
          <div key={i} style={{ minHeight: 90, border: `1px solid ${C.borderLight}`, borderRadius: 16, padding: 8, background: day ? C.white : "transparent" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: day ? C.text : C.textMuted }}>{day}</span>
            {posts.filter(p => day && new Date(p.date).getDate() === day).map(p => (
              <div key={p.id} style={{ fontSize: 9, background: C.primaryLight, color: C.primaryDark, padding: "3px 6px", borderRadius: 6, marginTop: 4, fontWeight: 600 }}>
                {p.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL (App) ──────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [posts, setPosts] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  // Escucha de Firebase
  useEffect(() => {
    const unsubPosts = onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
      setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    const unsubIdeas = onSnapshot(query(collection(db, "ideas"), orderBy("createdAt", "desc")), (snap) => {
      setIdeas(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => { unsubPosts(); unsubIdeas(); };
  }, []);

  const handleDeletePost = async (id) => {
    if(window.confirm("¿Borrar este post?")) await deleteDoc(doc(db, "posts", id));
  };

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", background: C.bgBody, minHeight: "100vh", display: "flex", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: 260, background: C.white, borderRight: `1px solid ${C.border}`, padding: "40px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.primary, marginBottom: 40, letterSpacing: "-1px" }}>
          Social<span style={{ color: C.accent }}>HQ</span>
        </div>
        {[
          { id: "dashboard", label: "Dashboard", icon: "⬡" },
          { id: "calendar", label: "Calendario", icon: "▦" },
          { id: "posts", label: "Posts", icon: "✦" },
          { id: "metrics", label: "Métricas", icon: "◉" },
          { id: "ideas", label: "Ideas", icon: "◈" }
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            width: "100%", background: tab === item.id ? C.primaryLight : "transparent",
            color: tab === item.id ? C.primaryDark : C.textSecondary,
            border: "none", borderRadius: 16, padding: "14px 20px", textAlign: "left", cursor: "pointer",
            fontWeight: 700, display: "flex", alignItems: "center", gap: 12, transition: "0.2s"
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "48px 64px", overflowY: "auto" }}>
        {tab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Dashboard</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Total Posts</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: C.primary }}>{posts.length}</div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Ideas</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: C.accent }}>{ideas.length}</div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Publicados</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: C.success }}>{posts.filter(p=>p.status==="publicado").length}</div>
              </Card>
            </div>
          </div>
        )}

        {tab === "calendar" && (
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Calendario</h1>
            <Card><CalendarView posts={posts} /></Card>
          </div>
        )}

        {tab === "posts" && (
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Gestionar Posts</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {posts.map(p => (
                <Card key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ fontSize: 24 }}>{PLATFORMS[p.platform]?.icon || "📄"}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: C.textSecondary }}>{p.date} • {p.platform}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Badge bg={STATUS_MAP[p.status]?.bg} color={STATUS_MAP[p.status]?.color}>{p.status}</Badge>
                    <button onClick={() => handleDeletePost(p.id)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontWeight: 700 }}>Borrar</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Las secciones de Métricas e Ideas se pueden expandir aquí siguiendo el mismo patrón */}
      </div>
    </div>
  );
}
