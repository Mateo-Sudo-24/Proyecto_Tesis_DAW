import { forwardRef, useState } from "react";
import PropTypes from "prop-types";

const styles = `
    .pw-input-wrap {
        position: relative;
        width: 100%;
    }
    .pw-input-wrap > input {
        padding-right: 2.75rem !important;
    }
    .pw-input-wrap > input::-ms-reveal,
    .pw-input-wrap > input::-ms-clear {
        display: none;
    }
    .pw-input-wrap > input::-webkit-credentials-auto-fill-button,
    .pw-input-wrap > input::-webkit-textfield-decoration-container {
        visibility: hidden;
        pointer-events: none;
    }
    .pw-toggle {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 2rem;
        height: 2rem;
        border: none;
        border-radius: 0.5rem;
        background: transparent;
        color: #6b7280;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 0.15s, background 0.15s;
    }
    .pw-toggle:hover {
        background: #f3f4f6;
        color: #111827;
    }
    .pw-toggle svg {
        width: 1.2rem;
        height: 1.2rem;
    }
`;

const EyeIcon = ({ hidden }) => (
    hidden ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3l18 18" />
            <path d="M10.58 10.58a2 2 0 002.84 2.84" />
            <path d="M9.88 4.24A10.76 10.76 0 0112 4c5 0 9 4.5 10 8a11.5 11.5 0 01-3.2 4.93" />
            <path d="M6.1 6.1A11.46 11.46 0 002 12c1 3.5 5 8 10 8a10.9 10.9 0 005.9-1.7" />
        </svg>
    ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
);

EyeIcon.propTypes = { hidden: PropTypes.bool };

const PasswordInput = forwardRef(({ className = "", wrapperClassName = "", buttonClassName = "", ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className={`pw-input-wrap ${wrapperClassName}`.trim()}>
            <style>{styles}</style>
            <input ref={ref} {...props} type={visible ? "text" : "password"} className={className} />
            <button
                type="button"
                className={`pw-toggle ${buttonClassName}`.trim()}
                onClick={() => setVisible(v => !v)}
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
                <EyeIcon hidden={visible} />
            </button>
        </div>
    );
});

PasswordInput.displayName = "PasswordInput";

PasswordInput.propTypes = {
    className: PropTypes.string,
    wrapperClassName: PropTypes.string,
    buttonClassName: PropTypes.string,
};

export default PasswordInput;
