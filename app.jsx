import { useState, useEffect } from "react";
// 1. Conexión a Firebase
import { db } from "./firebase"; 
import { collection, addDoc, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";

const PLATFORMS = {
  instagram: { name: "Instagram", color: "#E1306C", icon: "📸" },
  facebook: { name: "Facebook", color: "#1877F2", icon: "👥" },
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// Componentes de apoyo de tu diseño original
function PlatformBadge({ platform, small }) {
  const p = PLATFORMS[platform];
  return (
    <span style={{
      background: p.color + "22",
      color: p.color,
      border: `1px solid ${p.color}44`,
      borderRadius: 6,
      padding: small ? "2px 7px" : "3px 10px",
      fontSize: small ? 11 : 12,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
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
    <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [posts, setPosts] = useState([]); // Ahora se carga desde Firebase
  const [ideas, setIdeas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);

  // 2. Cargar posts en tiempo real desde Firebase
  useEffect(() => {
    const q = query(collection(db, "posts"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ ...doc.data(), id: doc.id });
      });
      setPosts(postsArray);
    });
    return () => unsubscribe();
  }, []);

  const handleSavePost = async (form) => {
    try {
      await addDoc(collection(db, "posts"), {
        ...form,
        likes: form.likes || 0,
        reach: form.reach || 0,
        createdAt: new Date()
      });
      setShowForm(false);
    } catch (e) {
      console.error("Error: ", e);
    }
  };

  const handleDeletePost = async (id) => {
    await deleteDoc(doc(db, "posts", id));
  };

  // --- El resto de tu lógica de Dashboard (totalPosts, etc) ---
  const totalPosts = posts.length;
  const scheduled = posts.filter(p => p.status === "programado").length;
  const published = posts.filter(p => p.status === "publicado").length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F1F5F9", minHeight: "100vh", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar original */}
        <div style={{ width: 220, background: "#1a1a2e", padding: "28px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#fff", marginBottom: 32, paddingLeft: 8 }}>
            <span style={{ color: "#818CF8" }}>◈</span> SocialHQ
          </div>
          {["dashboard", "posts"].map((id) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? "#6366F1" : "transparent",
              color: tab === id ? "#fff" : "#94A3B8",
              border: "none", borderRadius: 10, padding: "11px 14px", textAlign: "left", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", gap: 10
            }}>
              {id === "dashboard" ? "⬡" : "✦"} {id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>

        {/* Contenido Principal */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          {tab === "dashboard" && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
              <p style={{ color: "#64748B", marginBottom: 28 }}>Resumen conectado a Firebase</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#6366F1" }}>{totalPosts}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>Posts totales</div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#F59E0B" }}>{scheduled}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>Programados</div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#10B981" }}>{published}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>Publicados</div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Actividad reciente</h3>
                {posts.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>{p.platform}</div>
                    </div>
                    <button onClick={() => handleDeletePost(p.id)} style={{ border: "none", background: "none", color: "#EF4444", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {tab === "posts" && (
            <div>
               <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Posts</h1>
               <p>Gestiona tus contenidos desde aquí.</p>
               {/* Aquí puedes seguir pegando el resto de secciones de tu social-manager.jsx */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};
