import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const styles = `
.confirm-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; padding: 1rem;
    backdrop-filter: blur(2px);
}
.confirm-box {
    background: #fff;
    border-radius: 1rem;
    width: 100%; max-width: 400px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
    overflow: hidden;
    animation: confirm-in 0.18s ease-out;
}
@keyframes confirm-in {
    from { opacity: 0; transform: scale(0.94) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
}
.confirm-header {
    padding: 1.25rem 1.5rem 0.75rem;
}
.confirm-header h3 {
    margin: 0 0 0.35rem;
    font-size: 1.05rem;
    font-weight: 800;
    color: #111827;
}
.confirm-header p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
}
.confirm-actions {
    display: flex;
    gap: 0.625rem;
    padding: 1rem 1.5rem 1.25rem;
    justify-content: flex-end;
}
.confirm-btn-cancel {
    padding: 0.6rem 1.2rem;
    border-radius: 0.625rem;
    border: 1.5px solid #e5e7eb;
    background: #f9fafb;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
}
.confirm-btn-cancel:hover { background: #e5e7eb; }
.confirm-btn-confirm {
    padding: 0.6rem 1.2rem;
    border-radius: 0.625rem;
    border: none;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s;
}
.confirm-btn-confirm:hover { transform: translateY(-1px); }
.confirm-btn-confirm.danger  { background: #ef4444; color: #fff; }
.confirm-btn-confirm.danger:hover  { background: #dc2626; }
.confirm-btn-confirm.warning { background: #f59e0b; color: #fff; }
.confirm-btn-confirm.warning:hover { background: #d97706; }
.confirm-btn-confirm.primary { background: #e8760a; color: #fff; }
.confirm-btn-confirm.primary:hover { background: #c4620a; }
`;

/**
 * Reusable confirm dialog — replaces window.confirm calls.
 *
 * Props:
 *   open      : boolean
 *   title     : string
 *   message   : string
 *   confirmLabel : string (default: 'Confirmar')
 *   cancelLabel  : string (default: 'Cancelar')
 *   variant   : 'danger' | 'warning' | 'primary'  (default: 'danger')
 *   onConfirm : () => void
 *   onCancel  : () => void
 */
const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    onConfirm,
    onCancel,
}) => {
    const confirmRef = useRef(null);

    useEffect(() => {
        if (open) confirmRef.current?.focus();
    }, [open]);

    if (!open) return null;

    return (
        <>
            <style>{styles}</style>
            <div
                className="confirm-overlay"
                onClick={(e) => e.target === e.currentTarget && onCancel?.()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
            >
                <div className="confirm-box">
                    <div className="confirm-header">
                        <h3 id="confirm-title">{title}</h3>
                        {message && <p>{message}</p>}
                    </div>
                    <div className="confirm-actions">
                        <button className="confirm-btn-cancel" onClick={onCancel}>
                            {cancelLabel}
                        </button>
                        <button
                            ref={confirmRef}
                            className={`confirm-btn-confirm ${variant}`}
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

ConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    variant: PropTypes.oneOf(['danger', 'warning', 'primary']),
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
};

export default ConfirmDialog;
