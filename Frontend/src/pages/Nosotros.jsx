import { MdDesignServices } from "react-icons/md";
import { BiRecycle } from "react-icons/bi";
import { FaIndustry } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { FaCommentSms } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import heroImg from '../assets/home3.png';

/* ── CSS interno (mismo sistema que Home) ─────────────────────── */
const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }

    /* ── HEADER ── */
    .nos-header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 1px 6px rgba(0,0,0,0.07);
        position: sticky;
        top: 0;
        z-index: 50;
    }
    .nos-header-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem 3rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
    }
    .nos-logo {
        font-size: 2rem;
        font-weight: 900;
        color: var(--orange-main);
        letter-spacing: -1px;
        flex-shrink: 0;
        text-decoration: none;
    }
    .nos-logo span { color: #111827; }

    .nos-nav {
        display: flex;
        gap: 2rem;
        list-style: none;
        margin: 0; padding: 0;
    }
    .nos-nav a {
        font-weight: 600;
        font-size: 0.95rem;
        color: #4b5563;
        text-decoration: none;
        transition: color 0.18s;
    }
    .nos-nav a:hover { color: var(--orange-main); text-decoration: underline; }
    .nos-nav a.activo { color: var(--orange-main); text-decoration: underline; }

    .btn-login-nos {
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
    .btn-login-nos:hover {
        background: var(--orange-dark);
        border-color: var(--orange-dark);
        transform: translateY(-1px);
    }

    /* ── HERO ── */
    .nos-hero {
        position: relative;
        width: 100%;
        min-height: 460px;
        display: flex;
        align-items: flex-end;
        background-size: cover;
        background-position: center;
    }
    .nos-hero-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.45), rgba(0,0,0,0.82));
    }
    .nos-hero-content {
        position: relative; z-index: 10;
        max-width: 1200px; margin: 0 auto;
        padding: 0 3rem 4rem;
        color: #fff;
    }
    .nos-hero-eyebrow {
        font-size: 0.78rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.15em;
        color: var(--orange-border);
        margin-bottom: 0.5rem;
    }
    .nos-hero-title {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        font-weight: 900; text-transform: uppercase;
        line-height: 1.08; margin: 0 0 1rem;
    }
    .nos-hero-sub { font-size: 1.1rem; color: #d1d5db; max-width: 520px; margin-bottom: 1.5rem; }
    .nos-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #9ca3af; }
    .nos-breadcrumb a { color: #9ca3af; text-decoration: none; transition: color 0.18s; }
    .nos-breadcrumb a:hover { color: var(--orange-border); }
    .nos-breadcrumb .sep { color: #6b7280; }
    .nos-breadcrumb .current { color: var(--orange-border); font-weight: 700; }

    /* ── STATS FLOTANTES ── */
    .nos-stats {
        max-width: 1200px; margin: -2.5rem auto 0;
        padding: 0 3rem;
        position: relative; z-index: 20;
    }
    .nos-stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    @media (min-width: 1024px) {
        .nos-stats-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .nos-stat-card {
        background: #fff;
        border-radius: 1rem;
        padding: 1.5rem 1rem;
        text-align: center;
        box-shadow: 0 4px 18px rgba(0,0,0,0.1);
        transition: box-shadow 0.2s, transform 0.18s;
    }
    .nos-stat-card:hover { box-shadow: 0 6px 24px rgba(232,118,10,0.18); transform: translateY(-2px); }
    .nos-stat-val { font-size: 2rem; font-weight: 900; color: var(--orange-main); line-height: 1; }
    .nos-stat-lbl { font-size: 0.72rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-top: 0.35rem; }

    /* ── SECTION WRAPPER ── */
    .nos-section-wrap { max-width: 1200px; margin: 0 auto; padding: 3.5rem 3rem; }

    .nos-divider { position: relative; margin-bottom: 2.5rem; text-align: center; }
    .nos-divider h2 {
        display: inline-block;
        background: #fff;
        padding: 0 1rem;
        font-size: 1.75rem; font-weight: 800; color: #111827;
        position: relative; z-index: 1;
    }
    .nos-divider::before {
        content: '';
        position: absolute; top: 50%; left: 0; right: 0;
        border-top: 2px solid var(--orange-border);
        z-index: 0;
    }

    /* ── QUIÉNES SOMOS ── */
    .nos-quien-grid {
        display: flex; flex-wrap: wrap;
        gap: 3rem; align-items: stretch;
    }
    .nos-quien-img { flex: 1 1 300px; }
    .nos-quien-img-box {
        width: 100%; height: 100%; min-height: 320px;
        border-radius: 1.25rem;
        box-shadow: 0 6px 24px rgba(0,0,0,0.14);
        background-size: cover;
        background-position: center top;
    }
    .nos-quien-text { flex: 1 1 300px; display: flex; flex-direction: column; justify-content: center; }
    .nos-quien-text h3 { font-size: 1.5rem; font-weight: 900; color: var(--orange-dark); margin-bottom: 0.75rem; }
    .nos-quien-text p { color: #4b5563; line-height: 1.7; margin-bottom: 1rem; }
    .nos-feature-list { list-style: none; padding: 0; margin: 0 0 1.5rem; }
    .nos-feature-list li {
        display: flex; align-items: center; gap: 0.75rem;
        font-size: 0.95rem; color: #374151; font-weight: 600;
        padding: 0.45rem 0;
        border-bottom: 1px solid #f3f4f6;
    }
    .nos-feature-list li .icon-wrap {
        background: var(--orange-light);
        border-radius: 9999px;
        padding: 0.4rem;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        color: var(--orange-main);
        font-size: 1.25rem;
    }
    .btn-contactar {
        display: inline-block;
        padding: 0.7rem 2rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        border-radius: 9999px;
        text-decoration: none;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 4px 12px rgba(232,118,10,0.3);
        align-self: flex-start;
    }
    .btn-contactar:hover { background: var(--orange-dark); transform: translateY(-2px); }

    /* ── MISIÓN Y VISIÓN ── */
    .nos-mv-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }
    @media (min-width: 640px) { .nos-mv-grid { grid-template-columns: repeat(3, 1fr); } }

    .nos-mv-card {
        border-radius: 1.25rem;
        padding: 2rem;
        display: flex; flex-direction: column;
        align-items: center; text-align: center;
        border-bottom: 4px solid var(--orange-main);
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        transition: box-shadow 0.2s, transform 0.18s;
    }
    .nos-mv-card:hover { box-shadow: 0 6px 20px rgba(232,118,10,0.15); transform: translateY(-3px); }
    .nos-mv-card.light  { background: #fff8f0; }
    .nos-mv-card.medium { background: #fff3e0; }
    .nos-mv-card .emoji { font-size: 3rem; margin-bottom: 1rem; }
    .nos-mv-card h4 { font-size: 1.15rem; font-weight: 800; color: var(--orange-dark); margin-bottom: 0.75rem; }
    .nos-mv-card p  { font-size: 0.875rem; color: #6b7280; line-height: 1.65; }

    /* ── CTA BANNER ── */
    .nos-cta {
        background: #1f2937;
        padding: 4.5rem 3rem;
        text-align: center;
        color: #fff;
    }
    .nos-cta h2 {
        font-size: clamp(1.75rem, 3.5vw, 2.5rem);
        font-weight: 900; margin-bottom: 1rem;
    }
    .nos-cta p { color: #9ca3af; max-width: 520px; margin: 0 auto 2rem; font-size: 1.05rem; }
    .nos-cta-row { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .btn-cta-orange {
        padding: 0.75rem 2rem;
        background: var(--orange-main);
        color: #fff; font-weight: 800;
        border-radius: 9999px; text-decoration: none;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 4px 14px rgba(232,118,10,0.35);
    }
    .btn-cta-orange:hover { background: var(--orange-dark); transform: translateY(-2px); }
    .btn-cta-ghost {
        padding: 0.75rem 2rem;
        border: 2.5px solid var(--orange-main);
        color: var(--orange-main); font-weight: 800;
        border-radius: 9999px; text-decoration: none;
        transition: background 0.18s, color 0.18s, transform 0.15s;
    }
    .btn-cta-ghost:hover { background: var(--orange-main); color: #fff; transform: translateY(-2px); }

    /* ── FOOTER ── */
    .nos-footer { background: #fff8f0; border-radius: 2rem 2rem 0 0; }
    .nos-footer-inner { max-width: 1200px; margin: 0 auto; padding: 3rem; }
    .nos-footer-top { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: space-between; margin-bottom: 2rem; }
    .nos-footer-contact h3 { font-size: 1.5rem; font-weight: 900; color: var(--orange-dark); margin-bottom: 0.75rem; }
    .nos-footer-contact p  { font-weight: 600; color: #374151; margin: 0.3rem 0; }
    .nos-footer-nl { flex: 1; max-width: 440px; }
    .nos-footer-nl fieldset { border: 2px solid var(--orange-border); padding: 1rem; border-radius: 0.5rem; }
    .nos-footer-nl legend { background: var(--orange-dark); color: #fff; padding: 0.35rem 0.75rem; font-size: 0.85rem; font-weight: 700; border-radius: 0.25rem; }
    .nos-nl-row { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
    .nos-nl-row input { flex: 1; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
    .nos-nl-row input:focus { border-color: var(--orange-main); box-shadow: 0 0 0 2px rgba(232,118,10,0.15); }
    .nos-nl-row button { background: var(--orange-dark); color: #fff; font-weight: 700; padding: 0.5rem 1.25rem; border: none; border-radius: 0.5rem; cursor: pointer; transition: background 0.18s; }
    .nos-nl-row button:hover { background: var(--orange-main); }
    .nos-footer-hr { border: 1px solid var(--orange-border); margin: 1.5rem 0; }
    .nos-footer-copy { text-align: center; font-weight: 600; color: #6b7280; font-size: 0.875rem; }

    @media (max-width: 768px) {
        .nos-header-inner { padding: 0.75rem 1.5rem; }
        .nos-nav { display: none; }
        .nos-hero-content { padding: 0 1.5rem 3rem; }
        .nos-stats { padding: 0 1.5rem; }
        .nos-section-wrap { padding: 2.5rem 1.5rem; }
        .nos-cta { padding: 3rem 1.5rem; }
        .nos-footer-inner { padding: 2rem 1.5rem; }
        .nos-footer-top { flex-direction: column; }
        .nos-footer-nl { max-width: 100%; }
    }
`;

const Nosotros = () => {
    return (
        <>
            <style>{styles}</style>

            {/* ── HEADER ───────────────────────────────────────────── */}
            <header className="nos-header">
                <div className="nos-header-inner">
                    <a href="/home" className="nos-logo">IN<span>TEX</span></a>
                    <ul className="nos-nav">
                        <li><Link to="/home">Inicio</Link></li>
                        <li><Link to="/nosotros" className="activo">Nosotros</Link></li>
                        <li><Link to="/products">Productos</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>
                    <Link to="/login" className="btn-login-nos">Iniciar sesión</Link>
                </div>
            </header>

            {/* ── HERO ─────────────────────────────────────────────── */}
            <main
                className="nos-hero"
                style={{ backgroundImage: `url(${heroImg})` }}
            >
                <div className="nos-hero-overlay" />
                <div className="nos-hero-content">
                    <p className="nos-hero-eyebrow">INTEX · Nosotros</p>
                    <h1 className="nos-hero-title">Sobre Nosotros</h1>
                    <p className="nos-hero-sub">
                        Conoce la historia, misión y valores detrás de la plataforma textil más innovadora del mercado.
                    </p>
                    <nav className="nos-breadcrumb">
                        <Link to="/home">Inicio</Link>
                        <span className="sep">/</span>
                        <span className="current">Nosotros</span>
                    </nav>
                </div>
            </main>

            {/* ── STATS FLOTANTES ──────────────────────────────────── */}
            <div className="nos-stats">
                <div className="nos-stats-grid">
                    {[
                        { value: '10+',  label: 'Años de experiencia' },
                        { value: '500+', label: 'Clientes satisfechos' },
                        { value: '80+',  label: 'Tipos de tela' },
                        { value: '99%',  label: 'Calidad garantizada' },
                    ].map(({ value, label }) => (
                        <div key={label} className="nos-stat-card">
                            <p className="nos-stat-val">{value}</p>
                            <p className="nos-stat-lbl">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── QUIÉNES SOMOS ────────────────────────────────────── */}
            <section>
                <div className="nos-section-wrap">
                    <div className="nos-divider"><h2>QUIÉNES SOMOS</h2></div>
                    <div className="nos-quien-grid">
                        <div className="nos-quien-img">
                            <div
                                className="nos-quien-img-box"
                                style={{ backgroundImage: `url(${heroImg})` }}
                            />
                        </div>
                        <div className="nos-quien-text">
                            <h3>La primera plataforma textil con inteligencia artificial</h3>
                            <p>
                                En <strong style={{ color: 'var(--orange-dark)' }}>INTEX</strong> somos un equipo apasionado por la industria textil y la tecnología. Desarrollamos soluciones digitales que transforman la comercialización de telas, integrando inteligencia artificial, pagos en línea y catálogo digital en una sola plataforma.
                            </p>
                            <ul className="nos-feature-list">
                                {[
                                    { Icon: MdDesignServices, text: 'Catálogo digital con filtros avanzados' },
                                    { Icon: FaIndustry,       text: 'Gestión industrial centralizada' },
                                    { Icon: BsCashCoin,       text: 'Pagos seguros y flexibles' },
                                    { Icon: BiRecycle,        text: 'Tecnología ecológica sostenible' },
                                    { Icon: FaCommentSms,     text: 'Asesoría en línea 24/7' },
                                ].map(({ Icon, text }) => (
                                    <li key={text}>
                                        <span className="icon-wrap"><Icon /></span>
                                        {text}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/contacto" className="btn-contactar">Contáctanos</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MISIÓN Y VISIÓN ──────────────────────────────────── */}
            <section style={{ background: '#fff' }}>
                <div className="nos-section-wrap">
                    <div className="nos-divider"><h2>MISIÓN Y VISIÓN</h2></div>
                    <div className="nos-mv-grid">
                        <div className="nos-mv-card light">
                            <div className="emoji">🎯</div>
                            <h4>Nuestra Misión</h4>
                            <p>Ofrecer productos textiles de alta calidad con tecnología de vanguardia, simplificando la compra y venta de telas para moda, hogar e industria a nivel nacional.</p>
                        </div>
                        <div className="nos-mv-card medium">
                            <div className="emoji">🚀</div>
                            <h4>Nuestra Visión</h4>
                            <p>Ser la plataforma textil de referencia en Latinoamérica, reconocidos por nuestra excelencia en calidad, innovación digital y compromiso con el cliente.</p>
                        </div>
                        <div className="nos-mv-card light">
                            <div className="emoji">✨</div>
                            <h4>Nuestros Valores</h4>
                            <p>Integridad, innovación, sostenibilidad y compromiso con la calidad son los pilares que guían cada decisión en INTEX.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ───────────────────────────────────────── */}
            <section className="nos-cta">
                <h2>¿Listo para explorar nuestra colección?</h2>
                <p>Únete a cientos de clientes que ya confían en INTEX para sus necesidades textiles con la mejor tecnología.</p>
                <div className="nos-cta-row">
                    <Link to="/products" className="btn-cta-orange">Ver catálogo</Link>
                    <Link to="/contacto" className="btn-cta-ghost">Contáctanos</Link>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer className="nos-footer">
                <div className="nos-footer-inner">
                    <div className="nos-footer-top">
                        <div className="nos-footer-contact">
                            <h3>Contáctanos</h3>
                            <p>📧 intex@gmail.com &nbsp;|&nbsp; 📞 0998434399</p>
                            <p>📍 Av De los Granados y Río Coca</p>
                        </div>
                    </div>
                    <hr className="nos-footer-hr" />
                    <p className="nos-footer-copy">Copyright &copy; INTEX TEXTILES {new Date().getFullYear()}</p>
                </div>
            </footer>
        </>
    );
};

export default Nosotros;
