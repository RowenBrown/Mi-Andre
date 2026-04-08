import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, query,
  deleteDoc, doc, updateDoc, orderBy
} from "firebase/firestore";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
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
  borrador:    { bg: C.bgBody,        color: C.textSecondary, label: "Borrador"    },
  programado:  { bg: C.warningLight,  color: "#92400E",       label: "Programado"  },
  publicado:   { bg: C.successLight,  color: "#065F46",       label: "Publicado"   },
};

const TABS = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "calendar",  icon: "▦", label: "Calendario" },
  { id: "posts",     icon: "✦", label: "Posts"      },
  { id: "metrics",   icon: "◉", label: "Métricas"   },
  { id: "ideas",     icon: "◈", label: "Ideas"      },
];

const DAYS   = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ─── GLOBAL STYLES (injected once) ───────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Montserrat', sans-serif; background: ${C.bgBody}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0);     }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1);    }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,92,246,0.10) !important; }
  .btn-hover { transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease; }
  .btn-hover:hover { transform: translateY(-1px); opacity: 0.92; }
  .btn-hover:active { transform: translateY(0) scale(0.97); }
  .tab-btn { transition: background 0.18s ease, color 0.18s ease; }
  .tab-btn:hover { background: ${C.primaryLight} !important; color: ${C.primaryDark} !important; }
  .row-hover { transition: background 0.15s ease; }
  .row-hover:hover { background: ${C.bgBody} !important; }
  .idea-chip { transition: transform 0.15s, box-shadow 0.15s; cursor: pointer; }
  .idea-chip:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(139,92,246,0.12); }
  .del-btn { transition: opacity 0.15s, color 0.15s; }
  .del-btn:hover { opacity: 1 !important; color: ${C.danger} !important; }
  .modal-backdrop { animation: fadeIn 0.2s ease; }
  .modal-box { animation: scaleIn 0.22s ease; }
  .page-enter { animation: fadeInUp 0.35s ease both; }
  input, textarea, select {
    font-family: 'Montserrat', sans-serif;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${C.primary} !important;
    box-shadow: 0 0 0 3px ${C.primaryLight};
  }
`;

// ─── SMALL REUSABLE COMPONENTS ────────────────────────────────────────────────
function StyleInjector() {
  return <style>{GLOBAL_CSS}</style>;
}

function PlatformBadge({ platform, small }) {
  const p = PLATFORMS[platform];
  if (!p) return null;
  return (
    <span style={{
      background: C.bgBody, color: C.text,
      border: `1px solid ${C.border}`,
      borderRadius: 20, padding: small ? "2px 8px" : "4px 12px",
      fontSize: small ? 10 : 11, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
      letterSpacing: "0.5px", textTransform: "uppercase",
    }}>
      {p.icon} {p.name}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.borrador;
  return (
    <span style={{
      background: s.bg, color: s.color, borderRadius: 20,
      padding: "3px 10px", fontSize: 10, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.5px",
      border: `1px solid ${s.color}22`,
    }}>
      {s.label}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", small, style: extraStyle, disabled }) {
  const base = {
    border: "none", borderRadius: 30, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
    letterSpacing: "0.4px", display: "inline-flex", alignItems: "center",
    gap: 6, opacity: disabled ? 0.55 : 1,
  };
  const sizes = { padding: small ? "8px 16px" : "11px 22px", fontSize: small ? 11 : 13 };
  const variants = {
    primary:  { background: C.accent,   color: C.white,   boxShadow: `0 4px 12px ${C.accent}44` },
    secondary:{ background: C.bgBody,   color: C.text,    border: `1px solid ${C.border}` },
    danger:   { background: C.dangerLight, color: C.danger, border: `1px solid ${C.danger}33` },
    ghost:    { background: "transparent", color: C.textSecondary },
    success:  { background: C.successLight, color: C.success, border: `1px solid ${C.success}33` },
  };
  return (
    <button
      className="btn-hover"
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes, ...(variants[variant] || variants.primary), ...extraStyle }}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required, options }) {
  const fieldStyle = {
    width: "100%", padding: "10px 14px",
    border: `1px solid ${C.border}`, borderRadius: 10,
    fontSize: 13, color: C.text, background: C.white,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {label}{required && <span style={{ color: C.danger }}> *</span>}
      </label>
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={fieldStyle}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3} style={{ ...fieldStyle, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required={required} style={fieldStyle} />
      )}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  // Close on Escape key
  useEffect(() => {
    const handle = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(31,41,55,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20, backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          background: C.bgCard, borderRadius: 20, padding: "32px 36px",
          width: "100%", maxWidth: 520,
          boxShadow: "0 20px 60px rgba(139,92,246,0.18)",
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{title}</h2>
          <button onClick={onClose} style={{
            background: C.bgBody, border: `1px solid ${C.border}`,
            borderRadius: "50%", width: 32, height: 32,
            cursor: "pointer", fontSize: 16, color: C.textSecondary,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── POST FORM ────────────────────────────────────────────────────────────────
function PostForm({ initial, onSave, onClose, loading }) {
  const empty = { title: "", platform: "instagram", date: "", status: "borrador", caption: "" };
  const [form, setForm] = useState(initial || empty);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim() && form.date;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input label="Título" value={form.title} onChange={set("title")} placeholder="Nombre del post" required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Input label="Plataforma" value={form.platform} onChange={set("platform")} type="select"
          options={Object.entries(PLATFORMS).map(([k,v]) => ({ value: k, label: v.name }))} />
        <Input label="Fecha" value={form.date} onChange={set("date")} type="date" required />
      </div>
      <Input label="Estado" value={form.status} onChange={set("status")} type="select"
        options={Object.entries(STATUS_MAP).map(([k,v]) => ({ value: k, label: v.label }))} />
      <Input label="Caption / Descripción" value={form.caption} onChange={set("caption")}
        type="textarea" placeholder="Escribe el contenido del post..." />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={() => onSave(form)} disabled={!valid || loading}>
          {loading ? "Guardando…" : initial ? "Guardar cambios" : "Crear post"}
        </Btn>
      </div>
    </div>
  );
}

// ─── IDEA FORM ────────────────────────────────────────────────────────────────
function IdeaForm({ onSave, onClose, loading }) {
  const [text, setText] = useState("");
  const [tag, setTag]   = useState("contenido");
  const tags = ["contenido","campaña","reel","story","tendencia","otro"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input label="Idea" value={text} onChange={setText} type="textarea"
        placeholder="Describe tu idea…" required />
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: 8 }}>
          Etiqueta
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tags.map(t => (
            <button key={t} onClick={() => setTag(t)} style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              cursor: "pointer", border: `1px solid ${tag === t ? C.primary : C.border}`,
              background: tag === t ? C.primaryLight : C.bgBody,
              color: tag === t ? C.primaryDark : C.textSecondary,
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={() => onSave({ text, tag })} disabled={!text.trim() || loading}>
          {loading ? "Guardando…" : "Guardar idea"}
        </Btn>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div className="card-hover" style={{
      background: C.bgCard, borderRadius: 20, padding: "22px 26px",
      border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(107,114,128,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            {label}
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: color || C.accent, letterSpacing: "-1px" }}>
            {value}
          </div>
        </div>
        <div style={{
          fontSize: 22, background: `${color || C.accent}18`,
          borderRadius: 14, width: 48, height: 48,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────
function CalendarView({ posts }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year,  setYear]  = useState(today.getFullYear());

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const postsByDay = {};
  posts.forEach(p => {
    if (!p.date) return;
    const d = new Date(p.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const key = d.getDate();
      if (!postsByDay[key]) postsByDay[key] = [];
      postsByDay[key].push(p);
    }
  });

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{MONTHS[month]} {year}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ icon: "‹", fn: prev }, { icon: "›", fn: next }].map(({ icon, fn }) => (
            <button key={icon} onClick={fn} className="btn-hover" style={{
              background: C.bgBody, border: `1px solid ${C.border}`, borderRadius: "50%",
              width: 36, height: 36, cursor: "pointer", fontSize: 18, color: C.text,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{icon}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1px", paddingBottom: 8 }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div key={i} style={{
            minHeight: 78, border: `1px solid ${isToday(day) ? C.primary : C.border}`,
            borderRadius: 12, padding: "6px 8px",
            background: isToday(day) ? C.primaryLight : C.bgCard,
            boxShadow: isToday(day) ? `0 0 0 2px ${C.primary}55` : "none",
          }}>
            {day && (
              <>
                <div style={{ fontSize: 12, fontWeight: isToday(day) ? 800 : 500, color: isToday(day) ? C.primaryDark : C.text }}>
                  {day}
                </div>
                {(postsByDay[day] || []).map((p, idx) => (
                  <div key={idx} title={p.title} style={{
                    fontSize: 9, background: PLATFORMS[p.platform]?.color || C.accent,
                    color: C.white, borderRadius: 4, padding: "1px 5px", marginTop: 3,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontWeight: 600,
                  }}>
                    {PLATFORMS[p.platform]?.icon} {p.title}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── METRICS VIEW ─────────────────────────────────────────────────────────────
function MetricsView({ posts }) {
  const pub   = posts.filter(p => p.status === "publicado");
  const total = posts.length;
  const ig    = posts.filter(p => p.platform === "instagram").length;
  const fb    = posts.filter(p => p.platform === "facebook").length;

  const bar = (val, max, color) => (
    <div style={{ flex: 1, background: C.bgBody, borderRadius: 8, height: 10, overflow: "hidden" }}>
      <div style={{
        width: `${max ? Math.round((val/max)*100) : 0}%`,
        background: color, height: "100%", borderRadius: 8,
        transition: "width 0.6s ease",
      }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard label="Total posts" value={total} icon="📊" color={C.accent} />
        <StatCard label="Publicados"  value={pub.length} icon="✅" color={C.success} />
        <StatCard label="Tasa publicación" value={total ? `${Math.round((pub.length/total)*100)}%` : "—"} icon="📈" color={C.primary} />
      </div>
      <div style={{ background: C.bgCard, borderRadius: 20, padding: "24px 28px", border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>Distribución por plataforma</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Instagram 📸", val: ig, color: "#E1306C" },
            { label: "Facebook 👥",  val: fb, color: "#1877F2" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, width: 110 }}>{label}</div>
              {bar(val, total, color)}
              <div style={{ fontSize: 13, fontWeight: 700, color, width: 30, textAlign: "right" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: C.bgCard, borderRadius: 20, padding: "24px 28px", border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>Estado del contenido</h3>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {Object.entries(STATUS_MAP).map(([k, v]) => {
            const count = posts.filter(p => p.status === k).length;
            return (
              <div key={k} style={{
                flex: 1, minWidth: 120,
                background: v.bg || C.bgBody,
                border: `1px solid ${v.color}33`,
                borderRadius: 14, padding: "16px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: v.color }}>{count}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: v.color, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{v.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── IDEAS VIEW ───────────────────────────────────────────────────────────────
function IdeasView({ ideas, onAdd, onDelete }) {
  const tagColors = {
    contenido: C.accent, campaña: "#F59E0B", reel: "#EC4899",
    story: "#10B981", tendencia: "#8B5CF6", otro: C.textSecondary,
  };
  const groups = {};
  ideas.forEach(idea => {
    const t = idea.tag || "otro";
    if (!groups[t]) groups[t] = [];
    groups[t].push(idea);
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>Ideas</h1>
          <p style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>{ideas.length} ideas guardadas</p>
        </div>
        <Btn onClick={onAdd}>+ Nueva idea</Btn>
      </div>
      {ideas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💡</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Todavía no hay ideas.</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>¡Añade tu primera idea de contenido!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {Object.entries(groups).map(([tag, items]) => (
            <div key={tag}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: tagColors[tag] || C.textSecondary,
                textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 12,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: tagColors[tag] || C.textSecondary, display: "inline-block" }} />
                {tag} <span style={{ color: C.textMuted, fontWeight: 500 }}>({items.length})</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {items.map(idea => (
                  <div key={idea.id} className="idea-chip" style={{
                    background: C.bgCard, border: `1px solid ${C.border}`,
                    borderRadius: 16, padding: "16px 18px",
                    position: "relative",
                  }}>
                    <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5, paddingRight: 20 }}>{idea.text}</p>
                    <button
                      className="del-btn"
                      onClick={() => onDelete(idea.id)}
                      style={{
                        position: "absolute", top: 12, right: 12,
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 13, color: C.textMuted, opacity: 0.5, padding: 0,
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({ posts, ideas, onNewPost }) {
  const recent = [...posts].sort((a, b) => {
    const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
    const db_ = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
    return db_ - da;
  }).slice(0, 5);

  const upcoming = posts
    .filter(p => p.status === "programado" && p.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>Bienvenido a SocialHQ — todo bajo control.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <StatCard label="Posts totales"  value={posts.length}                               icon="📋" color={C.accent}   />
        <StatCard label="Publicados"     value={posts.filter(p=>p.status==="publicado").length} icon="✅" color={C.success}  />
        <StatCard label="Programados"    value={posts.filter(p=>p.status==="programado").length} icon="📅" color={C.warning}  />
        <StatCard label="Ideas"          value={ideas.length}                               icon="💡" color={C.primary}  />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Actividad reciente */}
        <div style={{ background: C.bgCard, borderRadius: 20, padding: "22px 26px", border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Actividad reciente</h3>
          {recent.length === 0 ? (
            <p style={{ fontSize: 13, color: C.textMuted }}>Aún no hay posts. <button onClick={onNewPost} style={{ color: C.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Crea el primero →</button></p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recent.map(p => (
                <div key={p.id} className="row-hover" style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 10px", borderRadius: 10, background: C.bgCard,
                }}>
                  <span style={{ fontSize: 20 }}>{PLATFORMS[p.platform]?.icon || "📄"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{p.date || "Sin fecha"}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Próximos posts */}
        <div style={{ background: C.bgCard, borderRadius: 20, padding: "22px 26px", border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Próximos programados</h3>
          {upcoming.length === 0 ? (
            <p style={{ fontSize: 13, color: C.textMuted }}>No hay posts próximos programados.</p>
          ) : upcoming.map(p => (
            <div key={p.id} className="row-hover" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 10px", borderRadius: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>{PLATFORMS[p.platform]?.icon || "📄"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.title}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{p.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── POSTS VIEW ───────────────────────────────────────────────────────────────
function PostsView({ posts, onNew, onDelete, onEdit }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = posts
    .filter(p => filter === "all" || p.status === filter)
    .filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>Posts</h1>
          <p style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>{posts.length} post{posts.length !== 1 ? "s" : ""} en total</p>
        </div>
        <Btn onClick={onNew}>+ Nuevo post</Btn>
      </div>

      {/* Filtros + búsqueda */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Buscar posts…"
          style={{
            padding: "9px 16px", border: `1px solid ${C.border}`, borderRadius: 30,
            fontSize: 13, color: C.text, background: C.bgCard,
            fontFamily: "'Montserrat', sans-serif", width: 220,
          }}
        />
        {["all","borrador","programado","publicado"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 16px", borderRadius: 20, border: `1px solid ${filter===f ? C.primary : C.border}`,
            background: filter===f ? C.primaryLight : C.bgCard,
            color: filter===f ? C.primaryDark : C.textSecondary,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            textTransform: "capitalize", transition: "all 0.15s",
          }}>
            {f === "all" ? "Todos" : STATUS_MAP[f]?.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: C.textMuted }}>
            <div style={{ fontSize: 40 }}>📭</div>
            <div style={{ marginTop: 10, fontWeight: 600 }}>No se encontraron posts.</div>
          </div>
        ) : filtered.map(p => (
          <div key={p.id} className="card-hover row-hover" style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "16px 22px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 24, width: 44, height: 44, borderRadius: 12,
                background: C.bgBody, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>{PLATFORMS[p.platform]?.icon || "📄"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{p.date || "Sin fecha"} · {PLATFORMS[p.platform]?.name || p.platform}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <StatusBadge status={p.status} />
              <Btn small variant="secondary" onClick={() => onEdit(p)}>✎ Editar</Btn>
              <button className="del-btn" onClick={() => onDelete(p.id)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 15, color: C.textMuted, opacity: 0.5, padding: 4,
              }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────
function Toast({ message, type, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 2800);
    return () => clearTimeout(t);
  }, [onHide]);
  const colors = { success: [C.successLight, C.success], error: [C.dangerLight, C.danger], info: [C.accentLight, C.accent] };
  const [bg, fg] = colors[type] || colors.info;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 2000,
      background: bg, color: fg,
      border: `1px solid ${fg}33`, borderRadius: 14,
      padding: "12px 20px", fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      animation: "slideDown 0.25s ease",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"} {message}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,      setTab]      = useState("dashboard");
  const [posts,    setPosts]    = useState([]);
  const [ideas,    setIdeas]    = useState([]);
  const [modal,    setModal]    = useState(null); // null | "post" | "idea"
  const [editPost, setEditPost] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null); // { message, type }

  const notify = (message, type = "success") => setToast({ message, type });

  // Firebase subscriptions
  useEffect(() => {
    const qP = query(collection(db, "posts"));
    const qI = query(collection(db, "ideas"));
    const unP = onSnapshot(qP, snap => setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id }))));
    const unI = onSnapshot(qI, snap => setIdeas(snap.docs.map(d => ({ ...d.data(), id: d.id }))));
    return () => { unP(); unI(); };
  }, []);

  // ── CRUD posts ──
  const handleSavePost = async (form) => {
    setSaving(true);
    try {
      if (editPost) {
        await updateDoc(doc(db, "posts", editPost.id), form);
        notify("Post actualizado correctamente.");
      } else {
        await addDoc(collection(db, "posts"), { ...form, createdAt: new Date(), likes: 0, reach: 0 });
        notify("Post creado correctamente.");
      }
      setModal(null); setEditPost(null);
    } catch (e) {
      console.error(e);
      notify("Error al guardar el post.", "error");
    } finally { setSaving(false); }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("¿Eliminar este post?")) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      notify("Post eliminado.", "info");
    } catch { notify("Error al eliminar.", "error"); }
  };

  const handleEditPost = (post) => { setEditPost(post); setModal("post"); };

  // ── CRUD ideas ──
  const handleSaveIdea = async (data) => {
    setSaving(true);
    try {
      await addDoc(collection(db, "ideas"), { ...data, createdAt: new Date() });
      notify("Idea guardada.");
      setModal(null);
    } catch { notify("Error al guardar la idea.", "error"); }
    finally { setSaving(false); }
  };

  const handleDeleteIdea = async (id) => {
    try {
      await deleteDoc(doc(db, "ideas", id));
      notify("Idea eliminada.", "info");
    } catch { notify("Error al eliminar.", "error"); }
  };

  const openNewPost = () => { setEditPost(null); setModal("post"); };

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", background: C.bgBody, minHeight: "100vh", display: "flex", color: C.text }}>
      <StyleInjector />

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 230, background: C.white, padding: "28px 16px",
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", gap: 4,
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.primary, marginBottom: 36, letterSpacing: "-0.5px", paddingLeft: 8 }}>
          Social<span style={{ color: C.accent }}>HQ</span>
        </div>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="tab-btn" style={{
            width: "100%",
            background: tab === t.id ? C.primaryLight : "transparent",
            color: tab === t.id ? C.primaryDark : C.textSecondary,
            border: "none", borderRadius: 12, padding: "13px 16px",
            textAlign: "left", cursor: "pointer", fontSize: 13,
            fontWeight: tab === t.id ? 700 : 500,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 17, opacity: tab === t.id ? 1 : 0.55 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        <div key={tab} className="page-enter">
          {tab === "dashboard" && <DashboardView posts={posts} ideas={ideas} onNewPost={openNewPost} />}
          {tab === "calendar"  && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", marginBottom: 24 }}>Calendario</h1>
              <div style={{ background: C.bgCard, borderRadius: 20, padding: "24px 28px", border: `1px solid ${C.border}` }}>
                <CalendarView posts={posts} />
              </div>
            </div>
          )}
          {tab === "posts"   && <PostsView posts={posts} onNew={openNewPost} onDelete={handleDeletePost} onEdit={handleEditPost} />}
          {tab === "metrics" && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", marginBottom: 24 }}>Métricas</h1>
              <MetricsView posts={posts} />
            </div>
          )}
          {tab === "ideas"   && <IdeasView ideas={ideas} onAdd={() => setModal("idea")} onDelete={handleDeleteIdea} />}
        </div>
      </div>

      {/* ── MODALES ── */}
      {modal === "post" && (
        <Modal title={editPost ? "Editar post" : "Nuevo post"} onClose={() => { setModal(null); setEditPost(null); }}>
          <PostForm initial={editPost} onSave={handleSavePost} onClose={() => { setModal(null); setEditPost(null); }} loading={saving} />
        </Modal>
      )}
      {modal === "idea" && (
        <Modal title="Nueva idea" onClose={() => setModal(null)}>
          <IdeaForm onSave={handleSaveIdea} onClose={() => setModal(null)} loading={saving} />
        </Modal>
      )}

      {/* ── TOAST ── */}
      {toast && <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />}
    </div>
  );
}
