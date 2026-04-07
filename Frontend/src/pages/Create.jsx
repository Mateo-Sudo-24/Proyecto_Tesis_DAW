import { useState } from 'react';
import { Form } from '../components/create/Form';
import storeProfile from '../context/storeProfile';

const Create = () => {
    const [tipoCreacion, setTipoCreacion] = useState(null);
    const { user } = storeProfile();

    // ✅ VALIDAR PERMISOS SEGÚN ROL
    const puedeCrearProducto = user?.rol === 'vendedor' || user?.rol === 'administrador';
    const puedeCrearUsuario = user?.rol === 'administrador';

    // Si ya seleccionó tipo, mostrar formulario
    if (tipoCreacion) {
        return (
            <div>
                <button
                    onClick={() => setTipoCreacion(null)}
                    className="mb-4 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                    ← Volver a seleccionar
                </button>
                <Form tipoCreacion={tipoCreacion} />
            </div>
        );
    }

    // Mostrar opciones de creación
    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500'>Agregar</h1>
            <hr className='my-4 border-t-2 border-gray-300' />
            <p className='mb-8'>Selecciona qué deseas crear</p>

            {/* ✅ OPCIONES DE CREACIÓN */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl'>
                {puedeCrearProducto && (
                    <button
                        onClick={() => setTipoCreacion('producto')}
                        className='p-8 border-2 border-amber-900 rounded-xl hover:bg-amber-50 transition text-center'
                    >
                        <h2 className='text-2xl font-bold text-amber-900 mb-2'>📦 Crear Producto</h2>
                        <p className='text-gray-600'>Sube un nuevo producto con imagen y detalles</p>
                    </button>
                )}

                {puedeCrearUsuario && (
                    <button
                        onClick={() => setTipoCreacion('usuario')}
                        className='p-8 border-2 border-blue-900 rounded-xl hover:bg-blue-50 transition text-center'
                    >
                        <h2 className='text-2xl font-bold text-blue-900 mb-2'>👤 Crear Usuario</h2>
                        <p className='text-gray-600'>Registra un nuevo vendedor o cliente</p>
                    </button>
                )}

                {!puedeCrearProducto && !puedeCrearUsuario && (
                    <div className='col-span-2 p-8 bg-red-50 border-2 border-red-300 rounded-xl text-center'>
                        <p className='text-red-600 font-semibold'>Sin permisos para crear</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Create;