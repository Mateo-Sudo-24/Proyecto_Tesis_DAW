// /components/treatments/ModalTreatments.jsx (o donde lo tengas)

import { useForm } from "react-hook-form";
// 1. CAMBIAMOS EL STORE A USAR
import useOrderStore from "../../stores/useOrderStore"; 

// 2. CAMBIAMOS EL NOMBRE DEL PROP PARA MAYOR CLARIDAD
const ModalTreatments = ({ clientID }) => {

    const { register, handleSubmit, formState: { errors } } = useForm();
    
    // 3. APUNTAMOS A LAS ACCIONES DEL STORE DE ÓRDENES
    // Asumimos que agregarás 'createCustomOrder' y 'toggleModal' a tu store
    const { createCustomOrder, toggleModal, loading } = useOrderStore();

    // 4. LA FUNCIÓN AHORA PREPARA Y ENVÍA LOS DATOS DE UNA ORDEN
    const handleCreateOrder = (data) => {
        // Añadimos el ID del cliente a los datos del formulario
        const orderData = { ...data, cliente: clientID };
        
        // Llamamos a la nueva acción en el store para crear la orden
        createCustomOrder(orderData);
    };

    return (
        // El overlay oscuro del fondo
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">

            {/* Contenedor del Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl">
                
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Registrar Nueva Orden
                    </h3>
                    <button 
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                        onClick={toggleModal}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </button>
                </div>
                
                {/* Formulario de la Orden */}
                <form className="p-6 space-y-4" onSubmit={handleSubmit(handleCreateOrder)}>
                    <div>
                        <label htmlFor="concepto" className="block mb-2 text-sm font-medium text-gray-700">Concepto de la Orden</label>
                        <input
                            type="text"
                            id="concepto"
                            placeholder="Ej: Servicio de mantenimiento, Producto X"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                            {...register("concepto", { required: "El concepto es obligatorio" })}
                        />
                        {errors.concepto && <p className="mt-1 text-xs text-red-600">{errors.concepto.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block mb-2 text-sm font-medium text-gray-700">Descripción</p>
                        <textarea
                            id="descripcion"
                            rows="3"
                            placeholder="Detalles del servicio, productos personalizados, etc."
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                            {...register("descripcion")}
                        />
                    </div>
                    <div>
                        <label htmlFor="total" className="block mb-2 text-sm font-medium text-gray-700">Monto Total ($)</p>
                        <input
                            type="number"
                            id="total"
                            step="0.01" 
                            placeholder="Ej: 150.50"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                            {...register("total", {
                                required: "El monto total es obligatorio",
                                valueAsNumber: true,
                                min: { value: 0.01, message: "El monto debe ser positivo" }
                            })}
                        />
                        {errors.total && <p className="mt-1 text-xs text-red-600">{errors.total.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="metodoPago" className="block mb-2 text-sm font-medium text-gray-700">Método de Pago</p>
                        <select
                            id="metodoPago"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                            {...register("metodoPago", { required: "Debes seleccionar un método de pago" })}
                        >
                            <option value="">--- Seleccionar ---</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                            <option value="Otro">Otro</option>
                        </select>
                        {errors.metodoPago && <p className="mt-1 text-xs text-red-600">{errors.metodoPago.message}</p>}
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center justify-end pt-4 gap-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-orange-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900"
                            onClick={toggleModal}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-orange-300"
                            disabled={loading}
                        >
                            {loading ? "Creando..." : "Crear Orden"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalTreatments;