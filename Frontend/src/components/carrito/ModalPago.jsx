import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from 'prop-types';

const styles = `
    :root {
        --orange-main: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
        --orange-border: #f0943a;
    }
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
        backdrop-filter: blur(3px);
    }
    .modal-box {
        background: #fff;
        border-radius: 1.25rem;
        width: 100%;
        max-width: 460px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        overflow: hidden;
        animation: modal-in 0.22s ease-out;
    }
    @keyframes modal-in {
        from { opacity: 0; transform: scale(0.95) translateY(12px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-header {
        background: #1f2937;
        padding: 1.5rem 1.75rem;
        color: #fff;
    }
    .modal-header h2 {
        font-size: 1.2rem;
        font-weight: 800;
        margin: 0 0 0.2rem;
    }
    .modal-header p { font-size: 0.82rem; color: #9ca3af; margin: 0; }
    .modal-body { padding: 1.5rem 1.75rem; }
    .modal-total-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--orange-light);
        border: 1px solid var(--orange-border);
        border-radius: 0.75rem;
        padding: 0.875rem 1.125rem;
        margin-bottom: 1.25rem;
    }
    .modal-total-label { font-size: 0.85rem; font-weight: 700; color: #374151; }
    .modal-total-amount { font-size: 1.35rem; font-weight: 900; color: var(--orange-dark); }
    .modal-card-wrap {
        border: 1.5px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1rem;
        background: #f9fafb;
        margin-bottom: 1.5rem;
        transition: border-color 0.18s;
    }
    .modal-card-wrap:focus-within {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.12);
        background: #fff;
    }
    .modal-card-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
        margin-bottom: 0.6rem;
        display: block;
    }
    .modal-actions { display: flex; gap: 0.75rem; }
    .btn-modal-cancel {
        flex: 1;
        padding: 0.75rem 1rem;
        background: #f3f4f6;
        color: #374151;
        font-weight: 700;
        font-size: 0.9rem;
        border-radius: 0.625rem;
        border: 1.5px solid #e5e7eb;
        cursor: pointer;
    }
    .btn-modal-cancel:hover:not(:disabled) { background: #e5e7eb; }
    .btn-modal-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-modal-pay {
        flex: 1;
        padding: 0.75rem 1rem;
        background: #16a34a;
        color: #fff;
        font-weight: 800;
        font-size: 0.9rem;
        border-radius: 0.625rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 3px 10px rgba(22,163,74,0.28);
    }
    .btn-modal-pay:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
    .btn-modal-pay:disabled { opacity: 0.55; cursor: not-allowed; }
    .modal-demo-btn {
        width: 100%;
        margin-top: 0.75rem;
        padding: 0.68rem 1rem;
        background: #fff7ed;
        color: #c4620a;
        font-weight: 800;
        font-size: 0.84rem;
        border-radius: 0.625rem;
        border: 1.5px solid #f0943a;
        cursor: pointer;
    }
    .modal-demo-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .modal-secure-note {
        text-align: center;
        font-size: 0.75rem;
        color: #9ca3af;
        margin-top: 1rem;
    }
`;

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const DEMO_PAYMENT_METHODS = Object.freeze({
    visa4242: 'demo_card_4242',
    stripeVisa: 'pm_card_visa',
    stripeMastercard: 'pm_card_mastercard',
});

const getTotalOrden = (orden) => {
    const totalFinal = Number(orden?.totalFinal);
    if (Number.isFinite(totalFinal) && totalFinal > 0) return totalFinal;
    const precioTotal = Number(orden?.precioTotal);
    if (Number.isFinite(precioTotal) && precioTotal > 0) return precioTotal;
    return 0;
};

const CheckoutForm = ({ orden, orderData, closeModal, onPagoCompletado }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const totalOrden = getTotalOrden(orden);

    const pagarOrden = async (paymentMethodId) => {
        const authToken = JSON.parse(localStorage.getItem("auth-token"))?.state?.token || '';
        const url = orderData
            ? `${import.meta.env.VITE_BACKEND_URL}/ordenes/pagar-tarjeta`
            : `${import.meta.env.VITE_BACKEND_URL}/ordenes/pagar`;
        const body = orderData
            ? { orderData, paymentMethodId }
            : { ordenId: orden._id, paymentMethodId };
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify(body),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.msg || "No se pudo completar el pago con tarjeta.");
        }
        return data;
    };

    const completarPago = async (paymentMethodId, esDemo = false) => {
        setIsLoading(true);
        try {
            const data = await pagarOrden(paymentMethodId);
            toast.success(esDemo ? "Pago demo aprobado correctamente." : "Pago realizado correctamente.");
            onPagoCompletado?.(data.orden);
            closeModal();
            navigate('/dashboard/mis-pedidos');
        } catch (error) {
            toast.error(error.message || "No se pudo completar el pago con tarjeta.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);
        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setIsLoading(false);
            toast.info("Para la demo usa 4242 4242 4242 4242, una fecha futura y cualquier CVC.");
            return;
        }

        await completarPago(paymentMethod.id);
    };

    return (
        <form onSubmit={handleSubmit}>
            <span className="modal-card-label">Datos de tarjeta</span>
            <div className="modal-card-wrap">
                <CardElement options={{ style: { base: { fontSize: '15px', color: '#374151', '::placeholder': { color: '#c0c0c0' } } } }} />
            </div>
            <div className="modal-actions">
                <button type="button" onClick={closeModal} disabled={isLoading} className="btn-modal-cancel">
                    Cancelar
                </button>
                <button type="submit" disabled={!stripe || isLoading} className="btn-modal-pay">
                    {isLoading ? 'Procesando...' : `Pagar $${totalOrden.toFixed(2)}`}
                </button>
            </div>
            <button
                type="button"
                className="modal-demo-btn"
                disabled={isLoading}
                onClick={() => completarPago(DEMO_PAYMENT_METHODS.visa4242, true)}
            >
                Usar tarjeta demo 4242
            </button>
            <p className="modal-secure-note">Pago seguro procesado por Stripe</p>
        </form>
    );
};

CheckoutForm.propTypes = {
    orden: PropTypes.shape({
        _id: PropTypes.string,
        precioTotal: PropTypes.number,
        totalFinal: PropTypes.number,
        codigoOrden: PropTypes.string
    }).isRequired,
    orderData: PropTypes.object,
    closeModal: PropTypes.func.isRequired,
    onPagoCompletado: PropTypes.func
};

CheckoutForm.defaultProps = {
    orderData: null,
    onPagoCompletado: null
};

const ModalPago = ({ orden, orderData, closeModal, onPagoCompletado }) => {
    if (!orden) return null;
    const totalOrden = getTotalOrden(orden);

    return (
        <>
            <style>{styles}</style>
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                <div className="modal-box">
                    <div className="modal-header">
                        <h2>Finalizar pago</h2>
                        <p>Orden #{orden.codigoOrden}</p>
                    </div>
                    <div className="modal-body">
                        <div className="modal-total-row">
                            <span className="modal-total-label">Total a pagar</span>
                            <span className="modal-total-amount">${totalOrden.toFixed(2)}</span>
                        </div>
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                orden={orden}
                                orderData={orderData}
                                closeModal={closeModal}
                                onPagoCompletado={onPagoCompletado}
                            />
                        </Elements>
                    </div>
                </div>
            </div>
        </>
    );
};

ModalPago.propTypes = {
    orden: PropTypes.shape({
        _id: PropTypes.string,
        precioTotal: PropTypes.number,
        totalFinal: PropTypes.number,
        codigoOrden: PropTypes.string
    }),
    orderData: PropTypes.object,
    closeModal: PropTypes.func.isRequired,
    onPagoCompletado: PropTypes.func
};

ModalPago.defaultProps = { orden: null, orderData: null, onPagoCompletado: null };

export default ModalPago;
