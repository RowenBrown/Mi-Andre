import { useState } from "react";

const PLATFORMS = {
  instagram: { name: "Instagram", color: "#E1306C", icon: "📸" },
  facebook: { name: "Facebook", color: "#1877F2", icon: "👥" },
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const INITIAL_POSTS = [
  { id: 1, platform: "instagram", title: "Lanzamiento colección verano", date: "2026-04-02", time: "10:00", status: "programado", content: "¡Nueva colección ya disponible! 🌞 #verano2026", likes: 0, reach: 0 },
  { id: 2, platform: "facebook", title: "Oferta especial fin de semana", date: "2026-04-05", time: "12:00", status: "programado", content: "Este fin de semana, 20% de descuento en toda la tienda.", likes: 0, reach: 0 },
  { id: 3, platform: "instagram", title: "Behind the scenes", date: "2026-03-25", time: "18:00", status: "publicado", content: "Un vistazo a cómo creamos todo desde cero 🎥", likes: 243, reach: 1820 },
  { id: 4, platform: "facebook", title: "Testimonio cliente destacado", date: "2026-03-20", time: "09:00", status: "publicado", content: '"Increíble experiencia, volvería sin dudarlo." - María G.', likes: 87, reach: 654 },
];

const INITIAL_IDEAS = [
  { id: 1, platform: "instagram", title: "Reel tutorial de producto", tags: ["educación", "viral"], priority: "alta" },
  { id: 2, platform: "facebook", title: "Encuesta: ¿qué contenido prefieres?", tags: ["engagement"], priority: "media" },
  { id: 3, platform: "instagram", title: "Colaboración con influencer local", tags: ["colaboración", "alcance"], priority: "alta" },
  { id: 4, platform: "facebook", title: "Post informativo sobre el sector", tags: ["educación"], priority: "baja" },
];

const METRICS = {
  instagram: { followers: 4820, growth: "+3.2%", likes: 1243, reach: 18400, engagement: "5.8%" },
  facebook: { followers: 2310, growth: "+1.1%", likes: 487, reach: 7200, engagement: "3.4%" },
};

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

function CalendarView({ posts }) {
  const [currentMonth, setCurrentMonth] = useState(3); // April (0-indexed)
  const [currentYear] = useState(2026);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const postsByDate = {};
  posts.forEach(p => {
    const d = p.date;
    if (!postsByDate[d]) postsByDate[d] = [];
    postsByDate[d].push(p);
  });

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))} style={navBtn}>‹</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))} style={navBtn}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9CA3AF", padding: "6px 0", letterSpacing: 1 }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayPosts = postsByDate[dateStr] || [];
          const isToday = dateStr === "2026-03-30";
          return (
            <div key={day} style={{
              minHeight: 64,
              border: isToday ? "2px solid #6366F1" : "1px solid #E5E7EB",
              borderRadius: 8,
              padding: "4px 5px",
              background: isToday ? "#EEF2FF" : "#fff",
              cursor: dayPosts.length ? "pointer" : "default",
            }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "#6366F1" : "#374151", marginBottom: 3 }}>{day}</div>
              {dayPosts.slice(0, 2).map(p => (
                <div key={p.id} style={{
                  background: PLATFORMS[p.platform].color,
                  color: "#fff",
                  fontSize: 9,
                  borderRadius: 4,
                  padding: "1px 4px",
                  marginBottom: 2,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  fontWeight: 600,
                }}>{PLATFORMS[p.platform].icon} {p.title}</div>
              ))}
              {dayPosts.length > 2 && <div style={{ fontSize: 9, color: "#9CA3AF" }}>+{dayPosts.length - 2} más</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyView({ posts }) {
  const [weekStart, setWeekStart] = useState(() => {
    // Start on Monday March 30, 2026
    return new Date(2026, 2, 30);
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const toDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const postsByDate = {};
  posts.forEach(p => {
    if (!postsByDate[p.date]) postsByDate[p.date] = [];
    postsByDate[p.date].push(p);
  });

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const weekEnd = days[6];
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const rangeLabel = sameMonth
    ? `${weekStart.getDate()} – ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
    : `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} – ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  const todayStr = "2026-03-30";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={prevWeek} style={navBtn}>‹</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          {rangeLabel}
        </span>
        <button onClick={nextWeek} style={navBtn}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {days.map((day, i) => {
          const dateStr = toDateStr(day);
          const dayPosts = postsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          return (
            <div key={i} style={{
              minHeight: 160,
              border: isToday ? "2px solid #6366F1" : "1px solid #E5E7EB",
              borderRadius: 12,
              padding: "10px 8px",
              background: isToday ? "#EEF2FF" : "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}>
              <div style={{ textAlign: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? "#6366F1" : "#9CA3AF", letterSpacing: 1, textTransform: "uppercase" }}>
                  {DAYS[i]}
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: isToday ? "#6366F1" : "#1E293B",
                  lineHeight: 1.2,
                }}>
                  {day.getDate()}
                </div>
              </div>
              {dayPosts.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: "#CBD5E1", textAlign: "center" }}>Sin posts</span>
                </div>
              )}
              {dayPosts.map(p => (
                <div key={p.id} style={{
                  background: PLATFORMS[p.platform].color,
                  borderRadius: 8,
                  padding: "6px 8px",
                }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", marginBottom: 2 }}>
                    {PLATFORMS[p.platform].icon} {p.time}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 600,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.3,
                  }}>{p.title}</div>
                  <div style={{
                    marginTop: 4,
                    fontSize: 9,
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "1px 5px",
                    display: "inline-block",
                    fontWeight: 600,
                  }}>
                    {p.status === "publicado" ? "✓ Publicado" : p.status === "programado" ? "⏰ Prog." : "✎ Borrador"}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Weekly summary */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        {["instagram", "facebook"].map(pl => {
          const count = days.reduce((acc, d) => {
            const ds = toDateStr(d);
            return acc + (postsByDate[ds] || []).filter(p => p.platform === pl).length;
          }, 0);
          return (
            <div key={pl} style={{
              background: "#fff",
              border: `1px solid ${PLATFORMS[pl].color}33`,
              borderLeft: `4px solid ${PLATFORMS[pl].color}`,
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>{PLATFORMS[pl].icon}</span>
              <div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{PLATFORMS[pl].name} esta semana</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: PLATFORMS[pl].color }}>{count} post{count !== 1 ? "s" : ""}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostForm({ onSave, onCancel, initial }) {
  const [form, setForm] = useState(initial || {
    platform: "instagram", title: "", date: "", time: "10:00", content: "", status: "programado"
  });
  return (
    <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 20, border: "1px solid #E5E7EB" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Plataforma</label>
          <select style={inputStyle} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
            <option value="instagram">📸 Instagram</option>
            <option value="facebook">👥 Facebook</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Estado</label>
          <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="programado">Programado</option>
            <option value="borrador">Borrador</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Fecha</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Hora</label>
          <input type="time" style={inputStyle} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Título</label>
        <input style={inputStyle} placeholder="Título del post..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Contenido</label>
        <textarea style={{ ...inputStyle, height: 80, resize: "vertical" }} placeholder="Escribe el texto del post..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ ...btnBase, background: "#F3F4F6", color: "#374151" }}>Cancelar</button>
        <button onClick={() => onSave(form)} style={{ ...btnBase, background: "#6366F1", color: "#fff" }}>Guardar post</button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [ideas, setIdeas] = useState(INITIAL_IDEAS);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [ideaForm, setIdeaForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ platform: "instagram", title: "", tags: "", priority: "media" });
  const [filterPlatform, setFilterPlatform] = useState("all");

  const filteredPosts = filterPlatform === "all" ? posts : posts.filter(p => p.platform === filterPlatform);

  const handleSavePost = (form) => {
    if (editPost) {
      setPosts(ps => ps.map(p => p.id === editPost.id ? { ...form, id: p.id } : p));
      setEditPost(null);
    } else {
      setPosts(ps => [...ps, { ...form, id: Date.now(), likes: 0, reach: 0 }]);
    }
    setShowForm(false);
  };

  const handleDeletePost = (id) => setPosts(ps => ps.filter(p => p.id !== id));
  const handleDeleteIdea = (id) => setIdeas(is => is.filter(i => i.id !== id));

  const handleSaveIdea = () => {
    setIdeas(is => [...is, { ...newIdea, id: Date.now(), tags: newIdea.tags.split(",").map(t => t.trim()).filter(Boolean) }]);
    setIdeaForm(false);
    setNewIdea({ platform: "instagram", title: "", tags: "", priority: "media" });
  };

  const totalPosts = posts.length;
  const scheduled = posts.filter(p => p.status === "programado").length;
  const published = posts.filter(p => p.status === "publicado").length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F1F5F9", minHeight: "100vh", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{
          width: 220,
          background: "#1a1a2e",
          padding: "28px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#fff", marginBottom: 32, paddingLeft: 8 }}>
            <span style={{ color: "#818CF8" }}>◈</span> SocialHQ
          </div>
          {[
            { id: "dashboard", icon: "⬡", label: "Dashboard" },
            { id: "calendar", icon: "▦", label: "Calendario" },
            { id: "weekly", icon: "▤", label: "Semana" },
            { id: "posts", icon: "✦", label: "Posts" },
            { id: "metrics", icon: "◉", label: "Métricas" },
            { id: "ideas", icon: "◈", label: "Ideas" },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? "#6366F1" : "transparent",
              color: tab === id ? "#fff" : "#94A3B8",
              border: "none",
              borderRadius: 10,
              padding: "11px 14px",
              textAlign: "left",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: tab === id ? 600 : 400,
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span> {label}
            </button>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 20 }}>
            <div style={{ background: "#ffffff11", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Conectado como</div>
              <div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600 }}>Rowema</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>📸 👥 activos</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>

          {/* DASHBOARD */}
          {tab === "dashboard" && (
            <div>
              <h1 style={pageTitle}>Dashboard</h1>
              <p style={{ color: "#64748B", marginBottom: 28 }}>Resumen de actividad — Marzo 2026</p>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Posts totales", value: totalPosts, icon: "✦", color: "#6366F1" },
                  { label: "Programados", value: scheduled, icon: "▲", color: "#F59E0B" },
                  { label: "Publicados", value: published, icon: "●", color: "#10B981" },
                  { label: "Ideas guardadas", value: ideas.length, icon: "◈", color: "#EC4899" },
                ].map(s => (
                  <div key={s.label} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
                      </div>
                      <span style={{ fontSize: 22, color: s.color + "55" }}>{s.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Próximos posts */}
              <div style={cardStyle}>
                <h3 style={sectionTitle}>Próximos posts programados</h3>
                {posts.filter(p => p.status === "programado").slice(0, 4).map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <div style={{ fontSize: 22 }}>{PLATFORMS[p.platform].icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>{p.date} · {p.time}</div>
                    </div>
                    <PlatformBadge platform={p.platform} small />
                  </div>
                ))}
                {posts.filter(p => p.status === "programado").length === 0 && (
                  <div style={{ color: "#94A3B8", fontSize: 14 }}>No hay posts programados.</div>
                )}
              </div>
            </div>
          )}

          {/* WEEKLY */}
          {tab === "weekly" && (
            <div>
              <h1 style={pageTitle}>Vista semanal</h1>
              <div style={cardStyle}>
                <WeeklyView posts={posts} />
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {tab === "calendar" && (
            <div>
              <h1 style={pageTitle}>Calendario</h1>
              <div style={cardStyle}>
                <CalendarView posts={posts} />
              </div>
            </div>
          )}

          {/* POSTS */}
          {tab === "posts" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ ...pageTitle, marginBottom: 0 }}>Posts</h1>
                <div style={{ display: "flex", gap: 8 }}>
                  {["all", "instagram", "facebook"].map(f => (
                    <button key={f} onClick={() => setFilterPlatform(f)} style={{
                      ...btnBase,
                      background: filterPlatform === f ? "#6366F1" : "#fff",
                      color: filterPlatform === f ? "#fff" : "#374151",
                      border: "1px solid #E5E7EB",
                      fontSize: 12,
                    }}>
                      {f === "all" ? "Todos" : PLATFORMS[f].icon + " " + PLATFORMS[f].name}
                    </button>
                  ))}
                  <button onClick={() => { setShowForm(true); setEditPost(null); }} style={{ ...btnBase, background: "#6366F1", color: "#fff" }}>
                    + Nuevo post
                  </button>
                </div>
              </div>

              {(showForm && !editPost) && (
                <div style={{ marginBottom: 20 }}>
                  <PostForm onSave={handleSavePost} onCancel={() => setShowForm(false)} />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredPosts.map(p => (
                  <div key={p.id}>
                    {editPost?.id === p.id ? (
                      <PostForm initial={editPost} onSave={handleSavePost} onCancel={() => setEditPost(null)} />
                    ) : (
                      <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, padding: "14px 20px" }}>
                        <div style={{ fontSize: 26 }}>{PLATFORMS[p.platform].icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                          <div style={{ fontSize: 12, color: "#94A3B8" }}>{p.date} · {p.time}</div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, maxWidth: 400, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.content}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <StatusBadge status={p.status} />
                          {p.status === "publicado" && (
                            <span style={{ fontSize: 12, color: "#64748B" }}>❤️ {p.likes} · 👁 {p.reach}</span>
                          )}
                          <button onClick={() => { setEditPost(p); setShowForm(false); }} style={{ ...iconBtn, color: "#6366F1" }}>✎</button>
                          <button onClick={() => handleDeletePost(p.id)} style={{ ...iconBtn, color: "#EF4444" }}>✕</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* METRICS */}
          {tab === "metrics" && (
            <div>
              <h1 style={pageTitle}>Métricas</h1>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                {Object.entries(METRICS).map(([platform, m]) => (
                  <div key={platform} style={{ ...cardStyle, borderTop: `4px solid ${PLATFORMS[platform].color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <span style={{ fontSize: 28 }}>{PLATFORMS[platform].icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{PLATFORMS[platform].name}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>Datos del mes</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Seguidores", value: m.followers.toLocaleString() },
                        { label: "Crecimiento", value: m.growth },
                        { label: "Me gusta totales", value: m.likes.toLocaleString() },
                        { label: "Alcance", value: m.reach.toLocaleString() },
                        { label: "Engagement", value: m.engagement },
                      ].map(stat => (
                        <div key={stat.label} style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{stat.label}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: PLATFORMS[platform].color }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={cardStyle}>
                <h3 style={sectionTitle}>Posts publicados con más alcance</h3>
                {posts.filter(p => p.status === "publicado").sort((a, b) => b.reach - a.reach).map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <PlatformBadge platform={p.platform} small />
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>❤️ {p.likes} · 👁 {p.reach}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IDEAS */}
          {tab === "ideas" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ ...pageTitle, marginBottom: 0 }}>Banco de ideas</h1>
                <button onClick={() => setIdeaForm(f => !f)} style={{ ...btnBase, background: "#6366F1", color: "#fff" }}>
                  + Nueva idea
                </button>
              </div>

              {ideaForm && (
                <div style={{ ...cardStyle, marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Plataforma</label>
                      <select style={inputStyle} value={newIdea.platform} onChange={e => setNewIdea(i => ({ ...i, platform: e.target.value }))}>
                        <option value="instagram">📸 Instagram</option>
                        <option value="facebook">👥 Facebook</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Prioridad</label>
                      <select style={inputStyle} value={newIdea.priority} onChange={e => setNewIdea(i => ({ ...i, priority: e.target.value }))}>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Tags (separados por coma)</label>
                      <input style={inputStyle} placeholder="viral, educación..." value={newIdea.tags} onChange={e => setNewIdea(i => ({ ...i, tags: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Idea</label>
                    <input style={inputStyle} placeholder="Describe tu idea..." value={newIdea.title} onChange={e => setNewIdea(i => ({ ...i, title: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => setIdeaForm(false)} style={{ ...btnBase, background: "#F3F4F6", color: "#374151" }}>Cancelar</button>
                    <button onClick={handleSaveIdea} style={{ ...btnBase, background: "#6366F1", color: "#fff" }}>Guardar idea</button>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {ideas.map(idea => {
                  const priorityColors = { alta: "#EF4444", media: "#F59E0B", baja: "#10B981" };
                  return (
                    <div key={idea.id} style={{ ...cardStyle, borderLeft: `4px solid ${priorityColors[idea.priority]}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <PlatformBadge platform={idea.platform} small />
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: priorityColors[idea.priority], fontWeight: 700 }}>
                            ● {idea.priority.charAt(0).toUpperCase() + idea.priority.slice(1)}
                          </span>
                          <button onClick={() => handleDeleteIdea(idea.id)} style={{ ...iconBtn, color: "#EF4444", fontSize: 12 }}>✕</button>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, color: "#1E293B" }}>{idea.title}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(idea.tags || []).map(tag => (
                          <span key={tag} style={{ background: "#EEF2FF", color: "#6366F1", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500 }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const cardStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};
const pageTitle = {
  fontFamily: "'Playfair Display', serif",
  fontSize: 28,
  fontWeight: 700,
  color: "#1a1a2e",
  marginBottom: 4,
};
const sectionTitle = {
  fontSize: 15,
  fontWeight: 700,
  color: "#1E293B",
  marginBottom: 14,
};
const btnBase = {
  border: "none",
  borderRadius: 8,
  padding: "8px 16px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};
const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  padding: "2px 4px",
};
const navBtn = {
  background: "#F1F5F9",
  border: "none",
  borderRadius: 8,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 18,
  color: "#374151",
};
const inputStyle = {
  width: "100%",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};
const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  display: "block",
  marginBottom: 5,
};
