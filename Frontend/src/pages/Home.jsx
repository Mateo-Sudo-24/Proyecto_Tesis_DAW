import { Link } from 'react-router-dom';
import { MdDashboard, MdDesignServices } from "react-icons/md";
import { FaRobot, FaIndustry } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { FaCommentSms } from "react-icons/fa6";
import { BiRecycle } from "react-icons/bi";
import { PiChatsTeardropLight } from "react-icons/pi";

import heroImage   from '../assets/home2.png';
import aboutImage  from '../assets/home1.png';
import bannerImage from '../assets/home3.png';

/* ── CSS interno ─────────────────────────────────────────────── */
const styles = `
    /* Paleta naranja cálido */
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }

    /* ── HEADER ── */
    .home-header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 1px 6px rgba(0,0,0,0.07);
        position: sticky;
        top: 0;
        z-index: 50;
    }
    .home-header-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem 3rem;          /* <-- más padding horizontal */
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
    }
    .home-logo {
        font-size: 2rem;
        font-weight: 900;
        color: var(--orange-main);
        letter-spacing: -1px;
        flex-shrink: 0;
        text-decoration: none;
    }
    .home-logo span { color: #111827; }

    .home-nav {
        display: flex;
        gap: 2rem;
        list-style: none;
        margin: 0; padding: 0;
    }
    .home-nav a {
        font-weight: 600;
        font-size: 0.95rem;
        color: #4b5563;
        text-decoration: none;
        transition: color 0.18s;
    }
    .home-nav a:hover,
    .home-nav a.activo { color: var(--orange-main); text-decoration: underline; }

    /* Botón "Iniciar sesión" — rectángulo cálido */
    .btn-login {
        display: inline-block;
        padding: 0.55rem 1.5rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
        border-radius: 0.5rem;       /* rectángulo con esquinas suaves */
        text-decoration: none;
        border: 2px solid var(--orange-main);
        transition: background 0.18s, transform 0.15s;
        flex-shrink: 0;
    }
    .btn-login:hover {
        background: var(--orange-dark);
        border-color: var(--orange-dark);
        transform: translateY(-1px);
    }

    /* ── HERO / MAIN ── */
    .home-main {
        background: #fff8f0;         /* naranja pastel muy suave */
        padding: 4rem 3rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 3rem;
    }
    .home-main-text { flex: 1; }
    .home-main-text h1 {
        font-size: clamp(2.5rem, 5vw, 4.5rem);
        font-weight: 900;
        text-transform: uppercase;
        color: var(--orange-dark);
        line-height: 1.1;
        margin-bottom: 1rem;
    }
    .home-main-text .sub-label {
        font-weight: 700;
        font-size: 1.25rem;
        text-decoration: underline;
        color: #374151;
        margin: 1.5rem 0 0.75rem;
    }
    .home-main-text .sub-desc {
        font-size: 1.15rem;
        color: #6b7280;
        margin-bottom: 2rem;
        max-width: 480px;
    }
    .home-cta-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .btn-cta-solid {
        padding: 0.75rem 2rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        border-radius: 9999px;
        text-decoration: none;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 4px 12px rgba(232,118,10,0.3);
    }
    .btn-cta-solid:hover { background: var(--orange-dark); transform: translateY(-2px); }
    .btn-cta-outline {
        padding: 0.75rem 2rem;
        background: #fff;
        color: var(--orange-main);
        font-weight: 800;
        border-radius: 9999px;
        border: 2.5px solid var(--orange-main);
        text-decoration: none;
        transition: background 0.18s, transform 0.15s;
    }
    .btn-cta-outline:hover { background: var(--orange-light); transform: translateY(-2px); }

    .home-main-img { flex: 1; display: none; }
    @media (min-width: 768px) { .home-main-img { display: block; } }
    .home-main-img img {
        width: 100%; max-height: 500px;
        object-fit: cover;
        border-radius: 1.25rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    /* ── SECCIONES GENÉRICAS ── */
    .section-wrap { max-width: 1200px; margin: 0 auto; padding: 3rem 3rem; }

    .section-divider { position: relative; margin-bottom: 2.5rem; text-align: center; }
    .section-divider h2 {
        display: inline-block;
        background: #fff;
        padding: 0 1rem;
        font-size: 1.75rem;
        font-weight: 800;
        color: #111827;
        position: relative;
        z-index: 1;
    }
    .section-divider::before {
        content: '';
        position: absolute;
        top: 50%; left: 0; right: 0;
        border-top: 2px solid var(--orange-border);
        z-index: 0;
    }

    /* ── NOSOTROS ── */
    .nosotros-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 3rem;
        align-items: center;
    }
    .nosotros-img { flex: 1 1 300px; }
    .nosotros-img img {
        width: 100%; height: 380px;
        object-fit: cover;
        border-radius: 1rem;
        box-shadow: 0 6px 24px rgba(0,0,0,0.12);
    }
    .nosotros-content { flex: 1 1 300px; }
    .nosotros-content p { font-size: 1.05rem; color: #374151; margin-bottom: 1rem; }
    .nosotros-list { list-style: none; padding: 0; margin: 0 0 1rem; }
    .nosotros-list li {
        display: flex; align-items: center; gap: 0.6rem;
        font-size: 1rem; color: #374151;
        padding: 0.4rem 0;
        border-bottom: 1px solid #f3f4f6;
    }
    .nosotros-list li svg { color: var(--orange-main); font-size: 1.3rem; flex-shrink: 0; }

    /* ── BANNER ── */
    .banner-section { position: relative; overflow: hidden; }
    .banner-section img { width: 100%; height: 18rem; object-fit: cover; display: block; }
    .banner-overlay {
        position: absolute; inset: 0;
        background: rgba(196,98,10,0.65);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        text-align: center; padding: 1.5rem;
        gap: 1rem;
    }
    .banner-overlay h3 {
        font-size: clamp(1.75rem, 4vw, 3rem);
        font-weight: 900;
        text-transform: uppercase;
        color: #fff;
        margin: 0;
    }
    .banner-overlay p { font-size: 1.1rem; color: #ffe0b2; max-width: 600px; margin: 0; }
    .btn-banner {
        padding: 0.7rem 2rem;
        background: #fff;
        color: var(--orange-dark);
        font-weight: 800;
        border-radius: 9999px;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        transition: background 0.18s;
    }
    .btn-banner:hover { background: var(--orange-light); }

    /* ── SERVICIOS ── */
    .servicios-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }
    .servicio-card {
        flex: 1 1 180px;
        text-align: center;
        padding: 2rem 1rem 2.5rem;
        background: #fff;
        position: relative;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        transition: box-shadow 0.2s;
        border-bottom: 3px solid var(--orange-main);
    }
    .servicio-card:nth-child(even) { background: #fff8f0; }
    .servicio-card:hover { box-shadow: 0 4px 20px rgba(232,118,10,0.18); }
    .servicio-card svg { color: var(--orange-main); font-size: 3rem; margin-bottom: 0.75rem; }
    .servicio-card h4 { font-size: 1.1rem; font-weight: 700; color: var(--orange-dark); margin: 0.5rem 0; }
    .servicio-card p  { font-size: 0.875rem; color: #6b7280; }

    /* ── FOOTER ── */
    .home-footer { background: #fff8f0; margin-top: 4rem; border-radius: 2rem 2rem 0 0; }
    .home-footer-inner { max-width: 1200px; margin: 0 auto; padding: 3rem; }
    .footer-top { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: space-between; margin-bottom: 2rem; }
    .footer-contact h3 { font-size: 1.5rem; font-weight: 900; color: var(--orange-dark); margin-bottom: 0.75rem; }
    .footer-contact p  { font-weight: 600; color: #374151; margin: 0.3rem 0; }
    .footer-newsletter { flex: 1; max-width: 440px; }
    .footer-newsletter fieldset { border: 2px solid var(--orange-border); padding: 1rem; border-radius: 0.5rem; }
    .footer-newsletter legend { background: #c4620a; color: #fff; padding: 0.35rem 0.75rem; font-size: 0.85rem; font-weight: 700; border-radius: 0.25rem; }
    .newsletter-row { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
    .newsletter-row input { flex: 1; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
    .newsletter-row input:focus { border-color: var(--orange-main); box-shadow: 0 0 0 2px rgba(232,118,10,0.15); }
    .newsletter-row button { background: var(--orange-dark); color: #fff; font-weight: 700; padding: 0.5rem 1.25rem; border: none; border-radius: 0.5rem; cursor: pointer; transition: background 0.18s; }
    .newsletter-row button:hover { background: var(--orange-main); }
    .footer-hr { border: 1px solid var(--orange-border); margin: 1.5rem 0; }
    .footer-copy { text-align: center; font-weight: 600; color: #6b7280; font-size: 0.875rem; }

    @media (max-width: 768px) {
        .home-header-inner { padding: 0.75rem 1.5rem; }
        .home-nav { display: none; }
        .home-main { flex-direction: column; padding: 2rem 1.5rem; }
        .section-wrap { padding: 2rem 1.5rem; }
        .footer-top { flex-direction: column; }
        .footer-newsletter { max-width: 100%; }
    }
`;

export const Home = () => {
    return (
        <>
            <style>{styles}</style>

            {/* ── HEADER ───────────────────────────────────────────── */}
            <header className="home-header">
                <div className="home-header-inner">
                    <a href="/home" className="home-logo">IN<span>TEX</span></a>

                    <ul className="home-nav">
                        <li><Link to="/home"     className="activo">Inicio</Link></li>
                        <li><Link to="/nosotros">Nosotros</Link></li>
                        <li><Link to="/products">Productos</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>

                    <Link to="/login" className="btn-login">Iniciar sesión</Link>
                </div>
            </header>

            {/* ── HERO / MAIN ──────────────────────────────────────── */}
            <main className="home-main">
                <div className="home-main-text">
                    <h1>Textiles<br />Premium</h1>
                    <p className="sub-label">Impulsado por</p>
                    <p className="sub-desc">
                        Inteligencia artificial, pasarela de pagos, catálogo digital y mucho más...
                    </p>
                    <div className="home-cta-row">
                        <a href="/products" className="btn-cta-solid">Ver Productos</a>
                        <a href="/login"    className="btn-cta-outline">Iniciar sesión</a>
                    </div>
                </div>
                <div className="home-main-img">
                    <img src={heroImage} alt="Textiles de calidad" />
                </div>
            </main>

            {/* ── NOSOTROS ─────────────────────────────────────────── */}
            <section>
                <div className="section-wrap">
                    <div className="section-divider"><h2>NOSOTROS</h2></div>
                    <div className="nosotros-grid">
                        <div className="nosotros-img">
                            <img src={aboutImage} alt="Sobre INTEX Textiles" />
                        </div>
                        <div className="nosotros-content">
                            <p>INTEX es la primera plataforma textil que incluye:</p>
                            <ul className="nosotros-list">
                                <li><MdDashboard />  Panel administrativo</li>
                                <li><FaRobot />      Inteligencia artificial</li>
                                <li><BsCashCoin />   Pasarela de pagos</li>
                                <li><FaCommentSms /> Chat en tiempo real</li>
                                <li><MdDesignServices /> Catálogo digital</li>
                                <li><BiRecycle />    Tecnología ecológica</li>
                            </ul>
                            <p>Y muchas más funcionalidades con tecnología de vanguardia.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── BANNER ───────────────────────────────────────────── */}
            <section className="banner-section">
                <img src={bannerImage} alt="Textiles INTEX" />
                <div className="banner-overlay">
                    <h3>Calidad que se siente</h3>
                    <p>Descubre nuestra colección completa de textiles para moda, hogar e industria.</p>
                    <a href="/products" className="btn-banner">Explorar catálogo</a>
                </div>
            </section>

            {/* ── SERVICIOS ────────────────────────────────────────── */}
            <section>
                <div className="section-wrap">
                    <div className="section-divider"><h2>SERVICIOS</h2></div>
                    <div className="servicios-grid">
                        <div className="servicio-card">
                            <MdDesignServices />
                            <h4>Catálogo Digital</h4>
                            <p>Explora nuestro extenso catálogo de telas con filtros avanzados y alta resolución.</p>
                        </div>
                        <div className="servicio-card">
                            <FaIndustry />
                            <h4>Gestión Industrial</h4>
                            <p>Herramientas para gestionar inventario, pedidos y proveedores centralizados.</p>
                        </div>
                        <div className="servicio-card">
                            <BsCashCoin />
                            <h4>Pagos Seguros</h4>
                            <p>Procesamiento rápido y seguro con múltiples métodos de pago disponibles.</p>
                        </div>
                        <div className="servicio-card">
                            <PiChatsTeardropLight />
                            <h4>Asesoría en Línea</h4>
                            <p>Chat en tiempo real con asesores especializados en textiles.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer className="home-footer">
                <div className="home-footer-inner">
                    <div className="footer-top">
                        <div className="footer-contact">
                            <h3>Contáctanos</h3>
                            <p>📧 contacto@intex.com &nbsp;|&nbsp; 📞 +593 99 564 4186</p>
                        </div>
                    </div>
                    <hr className="footer-hr" />
                    <p className="footer-copy">Copyright &copy; INTEX TEXTILES {new Date().getFullYear()}</p>
                </div>
            </footer>
        </>
    );
};