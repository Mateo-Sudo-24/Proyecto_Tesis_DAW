import { Link } from 'react-router-dom';

const forbiddenStyles = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 20px rgba(251, 191, 36, 0);
        }
    }

    @keyframes shake {
        0%, 100% {
            transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
            transform: translateX(-10px);
        }
        20%, 40%, 60%, 80% {
            transform: translateX(10px);
        }
    }

    .forbidden-root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
        padding: 2rem 1rem;
        font-family: 'Inter', system-ui, sans-serif;
        animation: fadeIn 0.6s ease-out;
    }

    .forbidden-icon {
        width: 200px;
        height: 200px;
        background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 6px solid #f59e0b;
        margin-bottom: 2rem;
        box-shadow: 0 20px 60px rgba(245, 158, 11, 0.3);
        animation: pulse 2s ease-in-out infinite;
    }

    .forbidden-code {
        font-size: 5rem;
        font-weight: 900;
        color: #92400e;
        letter-spacing: -4px;
        line-height: 1;
    }

    .forbidden-content {
        text-align: center;
        animation: fadeIn 0.8s ease-out 0.2s both;
    }

    .forbidden-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: #111827;
        margin: 0 0 1rem;
        letter-spacing: -0.02em;
    }

    .forbidden-message {
        font-size: 1.1rem;
        color: #6b7280;
        margin: 0 0 2rem;
        line-height: 1.6;
    }

    .forbidden-button {
        display: inline-block;
        padding: 1rem 2.5rem;
        background: linear-gradient(135deg, #4b5563 0%, #1f2937 100%);
        color: #fde68a;
        font-weight: 700;
        font-size: 1rem;
        border-radius: 0.875rem;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 16px rgba(31, 41, 55, 0.3);
        animation: fadeIn 1s ease-out 0.4s both;
    }

    .forbidden-button:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 8px 24px rgba(31, 41, 55, 0.4);
        background: linear-gradient(135deg, #374151 0%, #111827 100%);
        color: #fbbf24;
    }

    .forbidden-button:active {
        transform: translateY(-1px) scale(0.98);
    }

    @media (prefers-reduced-motion: reduce) {
        .forbidden-root,
        .forbidden-icon,
        .forbidden-content,
        .forbidden-button {
            animation: none;
        }
    }
`;

export const Forbidden = () => {
    return (
        <>
            <style>{forbiddenStyles}</style>
            <div className="forbidden-root">
                <div className="forbidden-icon">
                    <span className="forbidden-code">403</span>
                </div>
                <div className="forbidden-content">
                    <h1 className="forbidden-title">Acceso Denegado</h1>
                    <p className="forbidden-message">
                        No tienes permiso para ver esta página. Por favor contacta al administrador si crees que esto es un error.
                    </p>
                    <Link to="/" className="forbidden-button">
                        Regresar al inicio
                    </Link>
                </div>
            </div>
        </>
    );
};
