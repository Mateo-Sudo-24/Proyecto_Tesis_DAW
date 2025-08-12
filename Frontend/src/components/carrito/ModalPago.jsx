import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useFetch from '../../hooks/useFetch';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Formulario interno
const CheckoutForm = ({ orden, closeModal }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { fetchDataBackend, isLoading } = useFetch();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            toast.error(error.message);
            return;
        }

        // --- LLAMADA A LA API CORREGIDA ---
        // Se usa el formato de objeto esperado por tu useFetch
        const response = await fetchDataBackend({
            url: `${import.meta.env.VITE_BACKEND_URL}/ordenes/pagar`, // <-- RUTA CORREGIDA
            method: "POST",
            data: { ordenId: orden._id, paymentMethodId: paymentMethod.id },
        });

        if (response) {
            // El hook ya muestra el toast de éxito.
            closeModal(); // Cierra el modal
            navigate(`/orden-completa/${orden._id}`); // Redirige a la página de éxito
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-4 border rounded-md my-4 shadow-sm bg-white">
                <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button 
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    disabled={!stripe || isLoading}
                    className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:bg-green-300"
                >
                    {isLoading ? 'Procesando...' : `Pagar $${orden.precioTotal.toFixed(2)}`}
                </button>
            </div>
        </form>
    );
};

// Validación de props para CheckoutForm
CheckoutForm.propTypes = {
    orden: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        precioTotal: PropTypes.number.isRequired,
        codigoOrden: PropTypes.string
    }).isRequired,
    closeModal: PropTypes.func.isRequired
};

// Modal principal
const ModalPago = ({ orden, closeModal }) => {
    if (!orden) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-50 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Finalizar Pago</h2>
                <p className="mb-4 text-gray-500">Orden #{orden.codigoOrden}</p>

                <div className="bg-white p-4 rounded-md mb-4 border">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total a Pagar:</span>
                        <span>${orden.precioTotal.toFixed(2)}</span>
                    </div>
                </div>

                <Elements stripe={stripePromise}>
                    <CheckoutForm orden={orden} closeModal={closeModal} />
                </Elements>
            </div>
        </div>
    );
};

// Validación de props para ModalPago
ModalPago.propTypes = {
    orden: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        precioTotal: PropTypes.number.isRequired,
        codigoOrden: PropTypes.string
    }),
    closeModal: PropTypes.func.isRequired
};

// Valor por defecto para orden (opcional, pero buena práctica)
ModalPago.defaultProps = {
    orden: null
};

export default ModalPago;