import { useState, useEffect } from "react";
// 1. Conexión a Firebase
import { db } from "./firebase"; 
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from "firebase/firestore";

// --- NUEVA PALETA DE COLORES MINIMALISTA Y ELEGANTE ---
const COLORS = {
  primary: "#CBAAE3",      // Tu Lavanda Principal (Elegante)
  primaryLight: "#F3E8FF", // Lavanda Muy Claro (Para fondos suaves)
  accent: "#818CF8",       // Azul Índigo Suave (Para resaltar)
  text: "#1F2937",         // Gris Pizarra Muy Oscuro (Para textos principales)
  textSecondary: "#6B7280",// Gris Medio (Para subtítulos)
  bgBody: "#FAF5FF",       // Blanco Roto con Tinte Lavanda (Fondo principal)
  bgCard: "#FFFFFF",       // Blanco Puro (Para las tarjetas)
  border: "#E9D5FF",       // Lavanda Muy Suave (Para bordes finos)
  white: "#FFFFFF",
};

const PLATFORMS = {
  instagram: { name: "Instagram", color: "#E1306C", icon: "📸" },
  facebook: { name: "Facebook", color: "#1877F2", icon: "👥" },
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// --- COMPONENTES VISUALES REDISEÑADOS (MINIMALISTAS) ---
function PlatformBadge({ platform, small }) {
  const p = PLATFORMS[platform];
  return (
    <span style={{
      background: COLORS.bgBody,
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 20, // Más redondeado
      padding: small ? "2px 8px" : "4px 12px",
      fontSize: small ? 10 : 11,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    }}>
      {p.icon} {p.name}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    programado: { bg: "#FFF3CD", color: "#856404", label: "Programado" },
    publicado: { bg: "#D1FAE5", color: "#065F46", label: "Publicado" },
    borrador: { bg: "#F3F4F6", color: "#6B7280", label: "Borrador" },
  };
  const s = map[status] || map.borrador;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    }}>
      {s.label}
    </span>
  );
}

// --- VISTAS DEL CALENDARIO (ESTILO LIMPIO) ---
function CalendarView({ posts }) {
  const [currentMonth, setCurrentMonth] = useState(3); // Abril
  const [currentYear] = useState(2026);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text }}>{MONTHS[currentMonth]} {currentYear}</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={navBtn}>‹</button>
          <button style={navBtn}>›</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "1px", paddingBottom: 10 }}>{d}</div>)}
        {cells.map((day, i) => (
          <div key={i} style={{
            minHeight: 70,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 6,
            background: COLORS.bgCard,
            transition: "all 0.2s ease"
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.text }}>{day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL REDISEÑADO ---
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [posts, setPosts] = useState([]); 
  const [ideas, setIdeas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);

  // 2. Carga de datos desde Firebase
  useEffect(() => {
    const qPosts = query(collection(db, "posts"));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    const qIdeas = query(collection(db, "ideas"));
    const unsubIdeas = onSnapshot(qIdeas, (snap) => {
      setIdeas(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    return () => { unsubPosts(); unsubIdeas(); };
  }, []);

  // 3. Funciones de Firebase
  const handleSavePost = async (form) => {
    try {
      if (editPost) {
        await updateDoc(doc(db, "posts", editPost.id), form);
      } else {
        await addDoc(collection(db, "posts"), { ...form, createdAt: new Date(), likes: 0, reach: 0 });
      }
      setShowForm(false);
      setEditPost(null);
    } catch (e) { console.error("Error:", e); }
  };

  const handleDeletePost = async (id) => { await deleteDoc(doc(db, "posts", id)); };

  return (
    <div style={{
      fontFamily: "'Montserrat', sans-serif", // TU NUEVA FUENTE
      background: COLORS.bgBody,             // Fondo lavanda suave
      minHeight: "100vh",
      display: "flex",
      color: COLORS.text,
    }}>
      {/* Google Fonts Montserrat */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* SIDEBAR MINIMALISTA */}
      <div style={{
        width: 240,
        background: COLORS.white,             // Sidebar blanco para contraste
        padding: "30px 20px",
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        <div style={{
          fontSize: 24,
          fontWeight: 800,
          color: COLORS.primary,              // Tu Lavanda en el Logo
          marginBottom: 40,
          letterSpacing: "-0.5px"
        }}>
          Social<span style={{color: COLORS.accent}}>HQ</span>
        </div>
        {[
          { id: "dashboard", icon: "⬡" },
          { id: "calendar", icon: "▦" },
          { id: "posts", icon: "✦" },
          { id: "metrics", icon: "◉" },
          { id: "ideas", icon: "◈" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            width: "100%",
            background: tab === t.id ? COLORS.primaryLight : "transparent",
            color: tab === t.id ? COLORS.primary : COLORS.textSecondary,
            border: "none",
            borderRadius: 12, // Bordes muy redondeados
            padding: "14px 18px",
            textAlign: "left",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: tab === t.id ? 700 : 500,
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: 12,
            textTransform: "capitalize",
          }}>
            <span style={{ fontSize: 18, opacity: tab === t.id ? 1 : 0.6 }}>{t.icon}</span> {t.id}
          </button>
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, padding: "40px 50px", overflowY: "auto" }}>
        
        {tab === "dashboard" && (
          <div>
            <h1 style={pageTitleStyle}>Dashboard</h1>
            <p style={{ color: COLORS.textSecondary, marginBottom: 35, fontSize: 15 }}>Resumen conectado a Firebase</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 35 }}>
              <div style={cardStyle}>
                <div style={cardTitleStyle}>Posts totales</div>
                <div style={cardValueStyle}>{posts.length}</div>
              </div>
              <div style={cardStyle}>
                <div style={cardTitleStyle}>Ideas guardadas</div>
                <div style={cardValueStyle}>{ideas.length}</div>
              </div>
              <div style={cardStyle}>
                <div style={cardTitleStyle}>Publicados</div>
                <div style={cardValueStyle}>{posts.filter(p=>p.status==="publicado").length}</div>
              </div>
            </div>
          </div>
        )}

        {tab === "calendar" && (
          <div>
            <h1 style={pageTitleStyle}>Calendario</h1>
            <div style={{ ...cardStyle, padding: "25px 30px" }}><CalendarView posts={posts} /></div>
          </div>
        )}

        {tab === "posts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
              <h1 style={{ ...pageTitleStyle, marginBottom: 0 }}>Posts</h1>
              <button onClick={() => setShowForm(true)} style={{
                background: COLORS.accent,           // Botón azul suave para acción
                color: COLORS.white,
                border: "none",
                padding: "12px 24px",
                borderRadius: 30, // Botón tipo píldora
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                boxShadow: `0 4px 12px ${COLORS.accent}44`,
                transition: "all 0.2s ease"
              }}>+ Nuevo Post</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {posts.map(p => (
                <div key={p.id} style={{
                  ...cardStyle,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 25px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <div style={{ fontSize: 26, opacity: 0.8 }}>{PLATFORMS[p.platform]?.icon || "📄"}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>{p.date} · {p.platform}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <StatusBadge status={p.status} />
                    <button onClick={() => handleDeletePost(p.id)} style={{
                      color: "#EF4444", border: "none", background: "none", cursor: "pointer", fontSize: 16, opacity: 0.7, padding: 0
                    }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Puedes seguir añadiendo Metrics e Ideas siguiendo este nuevo estilo */}

      </div>
    </div>
  );
}

// --- ESTILOS REUTILIZABLES (MINIMALISTAS) ---
const cardStyle = {
  background: COLORS.bgCard,
  borderRadius: 20, // Bordes más curvos
  padding: "20px 25px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 2px 6px rgba(107, 114, 128, 0.03)", // Sombra muy sutil
  transition: "all 0.3s ease"
};

const pageTitleStyle = {
  fontSize: 32,
  fontWeight: 800,
  color: COLORS.text,
  marginBottom: 8,
  letterSpacing: "-1px",
};

const cardTitleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: COLORS.textSecondary,
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: 10
};

const cardValueStyle = {
  fontSize: 36,
  fontWeight: 800,
  color: COLORS.accent, // Usamos el azul suave para valores
  letterSpacing: "-1px"
};

const navBtn = {
  background: COLORS.bgBody,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "50%",
  width: 36,
  height: 36,
  cursor: "pointer",
  fontSize: 18,
  color: COLORS.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};
