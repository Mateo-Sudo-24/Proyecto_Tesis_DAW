import bannerImage from '../assets/home3.png';
import { Link } from 'react-router-dom';
import { MdEmail, MdPhone, MdBusiness } from 'react-icons/md';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { BsSendFill } from 'react-icons/bs';

/* ── CSS interno (mismo sistema que Home y Nosotros) ─────────── */
const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }

    /* ── HEADER ── */
    .con-header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 1px 6px rgba(0,0,0,0.07);
        position: sticky;
        top: 0;
        z-index: 50;
    }
    .con-header-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem 3rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
    }
    .con-logo {
        font-size: 2rem;
        font-weight: 900;
        color: var(--orange-main);
        letter-spacing: -1px;
        flex-shrink: 0;
        text-decoration: none;
    }
    .con-logo span { color: #111827; }

    .con-nav {
        display: flex;
        gap: 2rem;
        list-style: none;
        margin: 0; padding: 0;
    }
    .con-nav a {
        font-weight: 600;
        font-size: 0.95rem;
        color: #4b5563;
        text-decoration: none;
        transition: color 0.18s;
    }
    .con-nav a:hover { color: var(--orange-main); text-decoration: underline; }
    .con-nav a.activo { color: var(--orange-main); text-decoration: underline; }

    .btn-login-con {
        display: inline-block;
        padding: 0.55rem 1.5rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
        border-radius: 0.5rem;
        text-decoration: none;
        border: 2px solid var(--orange-main);
        transition: background 0.18s, transform 0.15s;
        flex-shrink: 0;
    }
    .btn-login-con:hover {
        background: var(--orange-dark);
        border-color: var(--orange-dark);
        transform: translateY(-1px);
    }

    /* ── HERO ── */
    .con-hero {
        position: relative;
        width: 100%;
        min-height: 460px;
        display: flex;
        align-items: flex-end;
        background-size: cover;
        background-position: center;
    }
    .con-hero-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.42), rgba(0,0,0,0.78));
    }
    .con-hero-content {
        position: relative; z-index: 10;
        max-width: 1200px; margin: 0 auto;
        padding: 0 3rem 4rem;
        color: #fff;
    }
    .con-hero-eyebrow {
        font-size: 0.78rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.15em;
        color: var(--orange-border);
        margin-bottom: 0.5rem;
    }
    .con-hero-title {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        font-weight: 900; text-transform: uppercase;
        line-height: 1.08; margin: 0 0 1rem;
    }
    .con-hero-sub { font-size: 1.1rem; color: #d1d5db; max-width: 520px; margin-bottom: 1.5rem; }
    .con-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #9ca3af; }
    .con-breadcrumb a { color: #9ca3af; text-decoration: none; transition: color 0.18s; }
    .con-breadcrumb a:hover { color: var(--orange-border); }
    .con-breadcrumb .sep { color: #6b7280; }
    .con-breadcrumb .current { color: var(--orange-border); font-weight: 700; }

    /* ── STATS FLOTANTES ── */
    .con-stats {
        max-width: 1200px; margin: -2.5rem auto 0;
        padding: 0 3rem;
        position: relative; z-index: 20;
    }
    .con-stats-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1rem;
    }
    @media (min-width: 640px)  { .con-stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .con-stats-grid { grid-template-columns: repeat(4, 1fr); } }

    .con-stat-card {
        background: #fff;
        border-radius: 1rem;
        padding: 1.25rem 1.25rem;
        display: flex; align-items: center; gap: 1rem;
        box-shadow: 0 4px 18px rgba(0,0,0,0.1);
        transition: box-shadow 0.2s, transform 0.18s;
    }
    .con-stat-card:hover { box-shadow: 0 6px 22px rgba(232,118,10,0.18); transform: translateY(-2px); }
    .con-stat-icon {
        background: var(--orange-light);
        color: var(--orange-main);
        border-radius: 9999px;
        padding: 0.85rem;
        font-size: 1.4rem;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: background 0.2s, color 0.2s;
    }
    .con-stat-card:hover .con-stat-icon { background: var(--orange-main); color: #fff; }
    .con-stat-lbl { font-size: 0.7rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 0.2rem; }
    .con-stat-val { font-size: 0.9rem; font-weight: 800; color: #111827; }

    /* ── SECTION WRAPPER ── */
    .con-section-wrap { max-width: 1200px; margin: 0 auto; padding: 3.5rem 3rem; }

    .con-divider { position: relative; margin-bottom: 2.5rem; text-align: center; }
    .con-divider h2 {
        display: inline-block;
        background: #fff;
        padding: 0 1rem;
        font-size: 1.75rem; font-weight: 800; color: #111827;
        position: relative; z-index: 1;
    }
    .con-divider::before {
        content: '';
        position: absolute; top: 50%; left: 0; right: 0;
        border-top: 2px solid var(--orange-border);
        z-index: 0;
    }

    /* ── CONTACTO GRID (Info + Form) ── */
    .con-main-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    @media (min-width: 768px) { .con-main-grid { grid-template-columns: 1fr 1fr; } }

    /* Panel izquierdo */
    .con-info-panel {
        background: #1f2937;
        color: #fff;
        border-radius: 1.25rem;
        padding: 2.5rem;
        display: flex; flex-direction: column; justify-content: space-between;
        box-shadow: 0 6px 24px rgba(0,0,0,0.18);
    }
    .con-info-panel h3 {
        font-size: 1.5rem; font-weight: 900;
        color: var(--orange-border);
        margin-bottom: 0.5rem;
    }
    .con-info-panel .sub { font-size: 0.875rem; color: #9ca3af; margin-bottom: 2rem; }
    .con-info-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1.5rem; }
    .con-info-list li { display: flex; align-items: flex-start; gap: 1rem; }
    .con-info-icon {
        background: rgba(232,118,10,0.18);
        color: var(--orange-border);
        border-radius: 9999px;
        padding: 0.6rem;
        font-size: 1.1rem;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
    }
    .con-info-list .lbl { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--orange-border); font-weight: 700; margin-bottom: 0.15rem; }
    .con-info-list .val { font-size: 0.95rem; font-weight: 600; color: #e5e7eb; }

    /* Panel derecho - Formulario */
    .con-form-panel {
        background: #fff;
        border-radius: 1.25rem;
        padding: 2.5rem;
        box-shadow: 0 4px 18px rgba(0,0,0,0.08);
    }
    .con-form-panel h3 { font-size: 1.5rem; font-weight: 900; color: var(--orange-dark); margin-bottom: 0.35rem; }
    .con-form-panel .sub { font-size: 0.85rem; color: #9ca3af; margin-bottom: 1.5rem; }

    .con-form-group { display: flex; flex-direction: column; gap: 1rem; }
    .con-input {
        width: 100%;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.625rem;
        padding: 0.7rem 1rem;
        font-size: 0.9rem; color: #374151;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        box-sizing: border-box;
    }
    .con-input:focus { border-color: var(--orange-main); box-shadow: 0 0 0 3px rgba(232,118,10,0.12); }
    .con-textarea { resize: none; }
    .btn-send {
        width: 100%;
        padding: 0.85rem 1rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800; font-size: 1rem;
        border: none; border-radius: 0.75rem;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 4px 14px rgba(232,118,10,0.3);
    }
    .btn-send:hover { background: var(--orange-dark); transform: translateY(-1px); }

    /* ── FOOTER ── */
    .con-footer { background: #fff8f0; border-radius: 2rem 2rem 0 0; margin-top: 4rem; }
    .con-footer-inner { max-width: 1200px; margin: 0 auto; padding: 3rem; }
    .con-footer-top { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: space-between; margin-bottom: 2rem; }
    .con-footer-contact h3 { font-size: 1.5rem; font-weight: 900; color: var(--orange-dark); margin-bottom: 0.75rem; }
    .con-footer-contact p  { font-weight: 600; color: #374151; margin: 0.3rem 0; }
    .con-footer-nl { flex: 1; max-width: 440px; }
    .con-footer-nl fieldset { border: 2px solid var(--orange-border); padding: 1rem; border-radius: 0.5rem; }
    .con-footer-nl legend { background: var(--orange-dark); color: #fff; padding: 0.35rem 0.75rem; font-size: 0.85rem; font-weight: 700; border-radius: 0.25rem; }
    .con-nl-row { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
    .con-nl-row input { flex: 1; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
    .con-nl-row input:focus { border-color: var(--orange-main); box-shadow: 0 0 0 2px rgba(232,118,10,0.15); }
    .con-nl-row button { background: var(--orange-dark); color: #fff; font-weight: 700; padding: 0.5rem 1.25rem; border: none; border-radius: 0.5rem; cursor: pointer; transition: background 0.18s; }
    .con-nl-row button:hover { background: var(--orange-main); }
    .con-footer-hr { border: 1px solid var(--orange-border); margin: 1.5rem 0; }
    .con-footer-copy { text-align: center; font-weight: 600; color: #6b7280; font-size: 0.875rem; }

    @media (max-width: 768px) {
        .con-header-inner { padding: 0.75rem 1.5rem; }
        .con-nav { display: none; }
        .con-hero-content { padding: 0 1.5rem 3rem; }
        .con-stats { padding: 0 1.5rem; }
        .con-section-wrap { padding: 2.5rem 1.5rem; }
        .con-footer-inner { padding: 2rem 1.5rem; }
        .con-footer-top { flex-direction: column; }
        .con-footer-nl { max-width: 100%; }
    }
`;

const Contact = () => {
    return (
        <>
            <style>{styles}</style>

            {/* ── HEADER ───────────────────────────────────────────── */}
            <header className="con-header">
                <div className="con-header-inner">
                    <a href="/home" className="con-logo">IN<span>TEX</span></a>
                    <ul className="con-nav">
                        <li><Link to="/home">Inicio</Link></li>
                        <li><Link to="/nosotros">Nosotros</Link></li>
                        <li><Link to="/products">Productos</Link></li>
                        <li><Link to="/contacto" className="activo">Contacto</Link></li>
                    </ul>
                    <Link to="/login" className="btn-login-con">Iniciar sesión</Link>
                </div>
            </header>

            {/* ── HERO ─────────────────────────────────────────────── */}
            <main
                className="con-hero"
                style={{ backgroundImage: `url(${bannerImage})` }}
            >
                <div className="con-hero-overlay" />
                <div className="con-hero-content">
                    <p className="con-hero-eyebrow">INTEX · Soporte</p>
                    <h1 className="con-hero-title">Contáctanos</h1>
                    <p className="con-hero-sub">
                        Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos a la brevedad.
                    </p>
                    <nav className="con-breadcrumb">
                        <Link to="/home">Inicio</Link>
                        <span className="sep">/</span>
                        <span className="current">Contacto</span>
                    </nav>
                </div>
            </main>

            {/* ── INFO CARDS FLOTANTES ──────────────────────────────── */}
            <div className="con-stats">
                <div className="con-stats-grid">
                    {[
                        { Icon: MdEmail,       lbl: 'Email',     val: 'contacto@intex.com' },
                        { Icon: MdPhone,       lbl: 'Teléfono',  val: '+593 99 564 4186' },
                        { Icon: FaMapMarkerAlt,lbl: 'Dirección', val: 'Av. Textiles S/N, Quito' },
                        { Icon: FaClock,       lbl: 'Horario',   val: 'Lun – Vie: 8:00 – 18:00' },
                    ].map(({ Icon, lbl, val }) => (
                        <div key={lbl} className="con-stat-card">
                            <span className="con-stat-icon"><Icon /></span>
                            <div>
                                <p className="con-stat-lbl">{lbl}</p>
                                <p className="con-stat-val">{val}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FORMULARIO + INFO ─────────────────────────────────── */}
            <section>
                <div className="con-section-wrap">
                    <div className="con-divider"><h2>ESCRÍBENOS</h2></div>
                    <div className="con-main-grid">

                        {/* Panel info */}
                        <div className="con-info-panel">
                            <div>
                                <h3>Información de contacto</h3>
                                <p className="sub">Completa el formulario y nos pondremos en contacto contigo lo antes posible.</p>
                                <ul className="con-info-list">
                                    {[
                                        { Icon: MdEmail,        lbl: 'Email',     val: 'contacto@intex.com' },
                                        { Icon: MdPhone,        lbl: 'Teléfono',  val: '+593 99 564 4186' },
                                        { Icon: MdBusiness,     lbl: 'Dirección', val: 'Av. de los Textiles S/N, Quito' },
                                        { Icon: FaClock,        lbl: 'Horario',   val: 'Lun – Vie: 8:00 am – 6:00 pm' },
                                    ].map(({ Icon, lbl, val }) => (
                                        <li key={lbl}>
                                            <span className="con-info-icon"><Icon /></span>
                                            <div>
                                                <p className="lbl">{lbl}</p>
                                                <p className="val">{val}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Formulario */}
                        <div className="con-form-panel">
                            <h3>Envíanos un mensaje</h3>
                            <p className="sub">Todos los campos son requeridos.</p>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="con-form-group">
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        className="con-input"
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Correo electrónico"
                                        className="con-input"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Asunto"
                                        className="con-input"
                                    />
                                    <textarea
                                        placeholder="Tu mensaje..."
                                        rows={5}
                                        className="con-input con-textarea"
                                        required
                                    />
                                    <button type="submit" className="btn-send">
                                        <BsSendFill /> Enviar mensaje
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer className="con-footer">
                <div className="con-footer-inner">
                    <div className="con-footer-top">
                        <div className="con-footer-contact">
                            <h3>Contáctanos</h3>
                            <p>📧 contacto@intex.com &nbsp;|&nbsp; 📞 +593 99 564 4186</p>
                        </div>
                    </div>
                    <hr className="con-footer-hr" />
                    <p className="con-footer-copy">Copyright &copy; INTEX TEXTILES {new Date().getFullYear()}</p>
                </div>
            </footer>
        </>
    );
};

export default Contact;