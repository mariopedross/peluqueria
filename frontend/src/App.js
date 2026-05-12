import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";
import { Home, Sparkles, Flower2, CalendarDays, User, Phone, MessageCircle, Instagram, MapPin, Share2, ArrowRight, X, ChevronLeft, Clock, Star, LogOut, Shield } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SALON_WA = "34622927352";
const SALON_IG = "estherpedros.hs";

// ---------- Helpers ----------
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = (s) => new Date(s + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

const showToast = (msg) => {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
};

// ---------- Gallery (fotos reales del salón) ----------
const FERIA1 = "https://customer-assets.emergentagent.com/job_mobile-booking-8/artifacts/clmegcgq_feria1.jpg";
const FERIA2 = "https://customer-assets.emergentagent.com/job_mobile-booking-8/artifacts/evr7xvif_feria2.jpg";
const TRENZA_FERIA = "https://customer-assets.emergentagent.com/job_mobile-booking-8/artifacts/aog78sxu_trenza_feria.jpg";
const RECOGIDO_TRENZADO = "https://customer-assets.emergentagent.com/job_mobile-booking-8/artifacts/znbsub8b_recogido_trenzado.jpg";
const BOB = "https://customer-assets.emergentagent.com/job_mobile-booking-8/artifacts/m0umh14j_bob.jpg";

const GALLERY = [
  { url: FERIA1, cap: "Recogido de feria con flor roja" },
  { url: TRENZA_FERIA, cap: "Trenzas laterales pegadas estilo feria" },
  { url: RECOGIDO_TRENZADO, cap: "Recogido bajo con trenza decorativa" },
  { url: FERIA2, cap: "Trenzas africanas con accesorios" },
  { url: BOB, cap: "Recogido pulido tipo bun elegante" },
  { url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=700&q=80", cap: "Color completo en tonos cálidos" },
  { url: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=700&q=80", cap: "Alisado de keratina · antes/después" },
  { url: "https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=700&q=80", cap: "Diseño de cejas con cera" },
  { url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=700&q=80", cap: "Tratamiento de hidratación profunda" },
  { url: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=700&q=80", cap: "Corte midi con movimiento" },
];

// ============ MAIN APP ============
export default function App() {
  // Detect /admin in URL
  const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  return isAdmin ? <AdminApp /> : <ClientApp />;
}

// ============ CLIENT APP ============
function ClientApp() {
  const [tab, setTab] = useState("home");
  const [services, setServices] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") : null;

  useEffect(() => {
    axios.get(`${API}/services`).then((r) => setServices(r.data)).catch(() => {});
  }, []);

  const goBooking = (s) => { setBookingService(s); setTab("book"); };

  return (
    <div className="shell">
      <Topbar />
      {tab === "home" && <HomeView services={services} onPickService={goBooking} onTab={setTab} />}
      {tab === "gallery" && <GalleryView onOpen={(g) => setLightbox(g)} />}
      {tab === "book" && <BookingView services={services} preselect={bookingService} onDone={() => { setBookingService(null); setTab("appts"); }} />}
      {tab === "appts" && <AppointmentsView />}
      {tab === "profile" && <ProfileView />}

      <BottomNav tab={tab} setTab={setTab} />
      <Toast />

      {lightbox && (
        <div className="lb show" onClick={() => setLightbox(null)} data-testid="lightbox">
          <button className="x" onClick={() => setLightbox(null)} aria-label="Cerrar"><X size={18} /></button>
          <img src={lightbox.url} alt={lightbox.cap} />
          <div className="cap">{lightbox.cap}</div>
        </div>
      )}
    </div>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="brand">
        <img src="/logo.svg" alt="Logo Esther Pedrós" />
        <div>
          <h1>Esther Pedrós</h1>
          <small>SALÓN · SEVILLA</small>
        </div>
      </div>
      <a className="ic" href={`https://wa.me/${SALON_WA}`} aria-label="WhatsApp" data-testid="topbar-whatsapp"><MessageCircle size={18} /></a>
    </header>
  );
}

function HomeView({ services, onPickService, onTab }) {
  const featured = services.slice(0, 4);
  return (
    <>
      <section className="hero">
        <img src="https://customer-assets.emergentagent.com/job_mobile-booking-8/artifacts/clmegcgq_feria1.jpg" alt="Esther Pedrós · trabajo de feria" />
        <div className="grad" />
        <div className="hero-inner">
          <div className="eyebrow">— Desde 2017 en Sevilla</div>
          <h2>El arte de<br />sentirte tú.</h2>
          <p>Cortes, color y tratamientos diseñados a medida en un espacio íntimo del centro de Sevilla.</p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => onTab("book")} data-testid="hero-book-btn">Reservar cita <ArrowRight size={15} /></button>
            <button className="btn btn-ghost" onClick={() => onTab("gallery")} data-testid="hero-gallery-btn">Ver trabajos</button>
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="stat"><div className="n">8</div><div className="l">Años</div></div>
        <div className="stat"><div className="n">500+</div><div className="l">Clientas</div></div>
        <div className="stat"><div className="n">5.0<Star size={11} fill="#c8a878" stroke="none" style={{ verticalAlign: "middle", marginLeft: 2 }} /></div><div className="l">Valoración</div></div>
      </div>

      <section className="section">
        <div className="sub">Nuestros servicios</div>
        <h3>Belleza con criterio</h3>
      </section>

      <div className="svc-grid" style={{ marginTop: 16 }}>
        {featured.map((s) => (
          <article key={s.id} className="svc" onClick={() => onPickService(s)} data-testid={`svc-${s.id}`}>
            <div className="svc-img"><img src={s.image} alt={s.name} loading="lazy" /><span className="svc-cat">{s.category}</span></div>
            <div className="svc-body">
              <h4>{s.name}</h4>
              <p>{s.description}</p>
              <div className="svc-foot">
                <div className="price">{s.price}€</div>
                <div className="dur"><Clock size={11} style={{ verticalAlign: "middle" }} /> {s.duration} min</div>
              </div>
            </div>
          </article>
        ))}
        <button className="btn btn-outline btn-block" style={{ marginTop: 4 }} onClick={() => onTab("book")} data-testid="see-all-services">Ver todos los servicios</button>
      </div>

      <section className="section">
        <div className="sub">Horario</div>
        <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", border: "1px solid var(--line)" }}>
          <Row k="Lunes a Viernes" v="9:00 – 20:00" />
          <Row k="Sábados" v="9:00 – 14:00" />
          <Row k="Domingos" v="Cerrado" muted />
        </div>
      </section>

      <section className="section" style={{ marginBottom: 30 }}>
        <div className="sub">Visítanos</div>
        <div className="prof-row" onClick={() => window.open(`https://wa.me/${SALON_WA}`)} data-testid="contact-whatsapp"><div className="pi"><MessageCircle size={18} /></div><div className="pt">WhatsApp · +34 622 927 352</div><div className="pa">›</div></div>
        <div className="prof-row" onClick={() => window.open(`https://instagram.com/${SALON_IG}`)} data-testid="contact-instagram"><div className="pi"><Instagram size={18} /></div><div className="pt">@{SALON_IG}</div><div className="pa">›</div></div>
        <div className="prof-row" onClick={() => window.open(`tel:+${SALON_WA}`)} data-testid="contact-phone"><div className="pi"><Phone size={18} /></div><div className="pt">Llamar al salón</div><div className="pa">›</div></div>
        <div className="prof-row" onClick={() => window.open("https://maps.google.com/?q=Sevilla")} data-testid="contact-map"><div className="pi"><MapPin size={18} /></div><div className="pt">Cómo llegar · Sevilla</div><div className="pa">›</div></div>
      </section>
    </>
  );
}

function Row({ k, v, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
      <span style={{ color: "var(--ink-2)" }}>{k}</span>
      <span style={{ color: muted ? "var(--mute)" : "var(--brand)", fontWeight: 500 }}>{v}</span>
    </div>
  );
}

function GalleryView({ onOpen }) {
  return (
    <>
      <section className="section">
        <div className="sub">Portfolio</div>
        <h3>Nuestros trabajos</h3>
      </section>
      <div className="gal-grid" style={{ marginTop: 16, marginBottom: 30 }}>
        {GALLERY.map((g, i) => (
          <div key={i} className="gimg" onClick={() => onOpen(g)} data-testid={`gallery-img-${i}`}>
            <img src={g.url} alt={g.cap} loading="lazy" />
            <div className="cap">{g.cap}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function BookingView({ services, preselect, onDone }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(preselect || null);
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [filter, setFilter] = useState("Todos");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const cats = ["Todos", ...Array.from(new Set(services.map((s) => s.category)))];
  const filtered = filter === "Todos" ? services : services.filter((s) => s.category === filter);

  useEffect(() => {
    if (step === 2 && date) {
      setLoading(true); setTime(null);
      axios.get(`${API}/availability?date_str=${date}`).then((r) => setSlots(r.data)).finally(() => setLoading(false));
    }
  }, [date, step]);

  useEffect(() => {
    if (preselect) setStep(2);
    const p = localStorage.getItem("user_phone"); const n = localStorage.getItem("user_name");
    if (p || n) setForm((f) => ({ ...f, phone: p || "", name: n || "" }));
  }, [preselect]);

  const submit = async () => {
    setErr("");
    if (!form.name.trim() || !form.phone.trim()) { setErr("Nombre y teléfono son obligatorios"); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/appointments`, {
        name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(),
        service_id: service.id, service_name: service.name, date, time, notes: form.notes
      });
      localStorage.setItem("user_phone", form.phone.trim());
      localStorage.setItem("user_name", form.name.trim());
      showToast("✓ Cita reservada · enviando confirmación por WhatsApp…");
      // Abrir WhatsApp con confirmación prerellenada al salón
      const msg = encodeURIComponent(
        `Hola Esther! ✨ Acabo de reservar una cita:\n\n` +
        `• Servicio: ${service.name}\n` +
        `• Fecha: ${fmtDate(date)}\n` +
        `• Hora: ${time}\n` +
        `• Nombre: ${form.name.trim()}\n` +
        `• Teléfono: ${form.phone.trim()}` +
        (form.notes ? `\n• Notas: ${form.notes}` : "")
      );
      setTimeout(() => { window.open(`https://wa.me/${SALON_WA}?text=${msg}`, "_blank"); }, 600);
      onDone();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Error reservando");
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <section className="section">
        <div className="sub">Reservar</div>
        <h3>{step === 1 ? "Elige tu servicio" : step === 2 ? "Día y hora" : "Tus datos"}</h3>
      </section>

      <div className="form-card">
        <div className="steps">
          {["Servicio", "Cuándo", "Datos"].map((t, i) => (
            <div key={i} className={`step ${step > i ? "done" : ""}`}>
              <div className="b">{i + 1}</div>
              <div className="t">{t}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="chips" style={{ paddingLeft: 0, paddingRight: 0, margin: "6px 0 14px" }}>
              {cats.map((c) => (
                <button key={c} className={`chip ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)} data-testid={`cat-${c}`}>{c}</button>
              ))}
            </div>
            <div className="svc-grid" style={{ margin: 0 }}>
              {filtered.map((s) => (
                <article key={s.id} className="svc" onClick={() => { setService(s); setStep(2); }} data-testid={`book-svc-${s.id}`}>
                  <div className="svc-img"><img src={s.image} alt={s.name} loading="lazy" /><span className="svc-cat">{s.category}</span></div>
                  <div className="svc-body">
                    <h4>{s.name}</h4>
                    <p>{s.description}</p>
                    <div className="svc-foot"><div className="price">{s.price}€</div><div className="dur"><Clock size={11} /> {s.duration} min</div></div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {step === 2 && service && (
          <>
            <div style={{ background: "var(--bg-2)", padding: "12px 14px", borderRadius: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--mute)" }}>SERVICIO</div><div className="serif" style={{ fontSize: 18, fontStyle: "italic", color: "var(--brand)" }}>{service.name}</div></div>
              <button className="chip" onClick={() => setStep(1)}>Cambiar</button>
            </div>
            <div className="field">
              <label>Fecha</label>
              <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} data-testid="booking-date" />
            </div>
            <div className="field">
              <label>{slots.closed ? "Domingo · cerrado" : "Hora disponible"}</label>
              {loading ? <div style={{ textAlign: "center", color: "var(--mute)", padding: 14, fontSize: 13 }}>Cargando…</div> : (
                <div className="slot-grid">
                  {slots.closed ? <div style={{ gridColumn: "span 3", textAlign: "center", color: "var(--mute)", fontSize: 13, padding: 12 }}>Elige otro día</div> :
                    (slots.slots && slots.slots.length ? slots.slots.map((s) => (
                      <div key={s} className={`slot ${time === s ? "on" : ""}`} onClick={() => setTime(s)} data-testid={`slot-${s}`}>{s}</div>
                    )) : <div style={{ gridColumn: "span 3", textAlign: "center", color: "var(--mute)", fontSize: 13, padding: 12 }}>Sin huecos disponibles ese día</div>)
                  }
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft size={14} /> Volver</button>
              <button className="btn btn-dark btn-block" disabled={!time} onClick={() => setStep(3)} data-testid="next-to-data">Continuar</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ background: "var(--bg-2)", padding: "12px 14px", borderRadius: 12, marginBottom: 14 }}>
              <div className="serif" style={{ fontSize: 18, fontStyle: "italic", color: "var(--brand)" }}>{service.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{fmtDate(date)} · {time}</div>
            </div>
            <div className="field"><label>Nombre completo *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" data-testid="booking-name" /></div>
            <div className="field"><label>Teléfono *</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+34 600 000 000" data-testid="booking-phone" /></div>
            <div className="field"><label>Email (opcional)</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="booking-email" /></div>
            <div className="field"><label>Notas (opcional)</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="¿Algo que debamos saber?" /></div>
            {err && <div className="err">{err}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}><ChevronLeft size={14} /> Volver</button>
              <button className="btn btn-dark btn-block" disabled={submitting} onClick={submit} data-testid="confirm-booking">{submitting ? "Reservando…" : "Confirmar reserva"}</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function AppointmentsView() {
  const [phone, setPhone] = useState(typeof window !== "undefined" ? localStorage.getItem("user_phone") || "" : "");
  const [input, setInput] = useState(phone);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = (p) => {
    if (!p) return;
    setLoading(true);
    axios.get(`${API}/appointments/by-phone/${encodeURIComponent(p)}`).then((r) => setList(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(phone); }, [phone]);

  const search = () => { setPhone(input); localStorage.setItem("user_phone", input); };

  const cancel = async (id) => {
    if (!window.confirm("¿Cancelar esta cita?")) return;
    await axios.delete(`${API}/appointments/${id}?phone=${encodeURIComponent(phone)}`);
    showToast("Cita cancelada");
    load(phone);
  };

  return (
    <>
      <section className="section">
        <div className="sub">Tus reservas</div>
        <h3>Mis citas</h3>
      </section>

      {!phone ? (
        <div className="form-card">
          <div className="field"><label>Introduce tu teléfono</label><input type="tel" value={input} onChange={(e) => setInput(e.target.value)} placeholder="+34 600 000 000" data-testid="appts-phone-input" /></div>
          <button className="btn btn-dark btn-block" onClick={search} data-testid="appts-search">Ver mis citas</button>
        </div>
      ) : loading ? <div className="empty">Cargando…</div> : list.length === 0 ? (
        <div className="empty"><div className="ico">No</div>No tienes citas todavía.<br /><br /><button className="btn btn-outline" onClick={() => { localStorage.removeItem("user_phone"); setPhone(""); }}>Cambiar teléfono</button></div>
      ) : (
        <>
          {list.map((a) => (
            <div key={a.id} className="appt" data-testid={`appt-${a.id}`}>
              <div className="appt-info">
                <h4>{a.service_name}</h4>
                <p>{fmtDate(a.date)}</p>
                <p>{a.time} · {a.name}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <span className={`badge bg-${a.status}`}>{statusLabel(a.status)}</span>
                {(a.status === "pending" || a.status === "confirmed") && (
                  <button className="chip" onClick={() => cancel(a.id)} data-testid={`cancel-${a.id}`}>Cancelar</button>
                )}
              </div>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button className="chip" onClick={() => { localStorage.removeItem("user_phone"); setPhone(""); }}>Cambiar teléfono</button>
          </div>
        </>
      )}
    </>
  );
}

function statusLabel(s) {
  return { pending: "Pendiente", confirmed: "Confirmada", cancelled: "Cancelada", completed: "Completada" }[s] || s;
}

function ProfileView() {
  return (
    <>
      <section className="section">
        <div className="sub">Cuenta</div>
        <h3>Mi perfil</h3>
      </section>
      <div style={{ margin: "10px 16px 20px", padding: 22, background: "linear-gradient(135deg,#f5b5c8,#d96e94)", borderRadius: 22, color: "#fff", textAlign: "center" }}>
        <img src="/logo.svg" alt="logo" style={{ width: 60, height: 60, margin: "0 auto 10px" }} />
        <div className="serif" style={{ fontSize: 24, fontStyle: "italic" }}>Club Esther Beauty</div>
        <div style={{ fontSize: 12, color: "#e9d5b9", marginTop: 4 }}>Acumula puntos con cada visita y consigue descuentos exclusivos</div>
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 999, height: 8, marginTop: 14, overflow: "hidden" }}>
          <div style={{ width: "60%", height: "100%", background: "#c8a878" }} />
        </div>
        <div style={{ fontSize: 11, marginTop: 6, color: "#e9d5b9" }}>300 puntos · Faltan 200 para un regalo</div>
      </div>

      <div className="prof-row" onClick={() => window.open(`https://wa.me/${SALON_WA}`)} data-testid="prof-wa"><div className="pi"><MessageCircle size={18} /></div><div className="pt">WhatsApp · +34 622 927 352</div><div className="pa">›</div></div>
      <div className="prof-row" onClick={() => window.open(`https://instagram.com/${SALON_IG}`)} data-testid="prof-ig"><div className="pi"><Instagram size={18} /></div><div className="pt">@{SALON_IG}</div><div className="pa">›</div></div>
      <div className="prof-row" onClick={() => navigator.share ? navigator.share({ title: "Esther Pedrós Salón", url: window.location.href }) : showToast("Enlace copiado") }><div className="pi"><Share2 size={18} /></div><div className="pt">Compartir salón</div><div className="pa">›</div></div>
      <a className="muted-link" href="/admin">Acceso staff →</a>
    </>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "home", lbl: "Inicio", Ic: Home },
    { id: "gallery", lbl: "Galería", Ic: Sparkles },
    { id: "book", lbl: "Reservar", Ic: Flower2 },
    { id: "appts", lbl: "Mis Citas", Ic: CalendarDays },
    { id: "profile", lbl: "Perfil", Ic: User },
  ];
  return (
    <nav className="bnav">
      {items.map(({ id, lbl, Ic }) => (
        <div key={id} className={`ni ${tab === id ? "on" : ""}`} onClick={() => setTab(id)} data-testid={`nav-${id}`}>
          <Ic size={22} />
          <span>{lbl}</span>
        </div>
      ))}
    </nav>
  );
}

function Toast() { return <div className="toast" id="toast" data-testid="toast"></div>; }

// ============ ADMIN APP ============
function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  if (!token) return <AdminLogin onLogin={(t) => { localStorage.setItem("admin_token", t); setToken(t); }} />;
  return <AdminPanel token={token} logout={() => { localStorage.removeItem("admin_token"); setToken(""); }} />;
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("mariopedrosgarcia123@gmail.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await axios.post(`${API}/admin/login`, { email, password });
      onLogin(r.data.token);
    } catch (e2) { setErr(e2?.response?.data?.detail || "Credenciales incorrectas"); }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={submit}>
        <img src="/logo.svg" alt="logo" />
        <h2>Panel del Salón</h2>
        <p>ACCESO STAFF</p>
        <div className="field"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-email" /></div>
        <div className="field"><label>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-password" /></div>
        {err && <div className="err">{err}</div>}
        <button className="btn btn-dark btn-block" disabled={loading} data-testid="admin-login-btn">{loading ? "Entrando…" : "Entrar"}</button>
        <a className="muted-link" href="/">← Volver al salón</a>
      </form>
    </div>
  );
}

function AdminPanel({ token, logout }) {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, today: 0 });
  const [filter, setFilter] = useState("");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const load = () => {
    const q = filter ? `?status=${filter}` : "";
    axios.get(`${API}/admin/appointments${q}`, { headers }).then((r) => setList(r.data));
    axios.get(`${API}/admin/stats`, { headers }).then((r) => setStats(r.data));
  };

  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  const update = async (id, status) => {
    await axios.patch(`${API}/admin/appointments/${id}`, { status }, { headers });
    load();
  };

  return (
    <div style={{ background: "var(--bg-2)", minHeight: "100vh", paddingBottom: 40 }}>
      <div className="topbar" style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="brand"><img src="/logo.svg" alt="logo" /><div><h1>Panel Admin</h1><small>STAFF</small></div></div>
        <button className="ic" onClick={logout} data-testid="admin-logout"><LogOut size={16} /></button>
      </div>
      <div className="admin-shell">
        <div className="adm-stats">
          <div className="stat"><div className="n">{stats.today}</div><div className="l">Hoy</div></div>
          <div className="stat"><div className="n">{stats.pending}</div><div className="l">Pendientes</div></div>
          <div className="stat"><div className="n">{stats.confirmed}</div><div className="l">Confirmadas</div></div>
          <div className="stat"><div className="n">{stats.total}</div><div className="l">Total</div></div>
        </div>

        <div className="chips" style={{ padding: 0, marginBottom: 14 }}>
          {[["", "Todas"], ["pending", "Pendientes"], ["confirmed", "Confirmadas"], ["completed", "Completadas"], ["cancelled", "Canceladas"]].map(([v, l]) => (
            <button key={v} className={`chip ${filter === v ? "active" : ""}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        <div className="admin-card">
          {list.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "var(--mute)" }}>Sin citas</div> :
            list.map((a) => (
              <div key={a.id} className="adm-row">
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 18, fontStyle: "italic", color: "var(--brand)" }}>{a.service_name}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{fmtDate(a.date)} · {a.time}</div>
                  <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>
                    <strong style={{ color: "var(--ink-2)" }}>{a.name}</strong> · {a.phone}{a.email ? ` · ${a.email}` : ""}
                  </div>
                  {a.notes && <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4, fontStyle: "italic" }}>"{a.notes}"</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span className={`badge bg-${a.status}`}>{statusLabel(a.status)}</span>
                  <div className="adm-actions">
                    {a.status !== "confirmed" && <button className="ok" onClick={() => update(a.id, "confirmed")}>Confirmar</button>}
                    {a.status !== "completed" && a.status !== "cancelled" && <button onClick={() => update(a.id, "completed")}>Completar</button>}
                    {a.status !== "cancelled" && <button className="x" onClick={() => update(a.id, "cancelled")}>Cancelar</button>}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
