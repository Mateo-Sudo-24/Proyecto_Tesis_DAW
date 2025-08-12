import { Link } from 'react-router-dom';

// Importa tu nueva imagen de error 404.
// Asegúrate de que la ruta sea correcta desde la ubicación de este archivo.
// Por ejemplo, si tu imagen está en 'src/assets/', la ruta sería '../assets/mi-imagen-404.png'
import imagen404 from '../assets/404.jpg'; // <-- CAMBIA ESTA RUTA

export const NotFound = () => {
    return (
        // Contenedor principal: ocupa toda la pantalla, fondo gris claro, centra todo
        <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-center px-4">
            
            {/* Título principal "Oops!" */}
            <h1 className="text-6xl md:text-7xl font-bold text-slate-800 mb-4">Oops!</h1>
            
            {/* Contenedor de la Imagen */}
            <div className="my-4">
                <img
                    // Usa la imagen importada
                    src={imagen404}
                    // Define el tamaño de tu imagen
                    className="h-64 w-64 md:h-80 md:w-80 object-contain"
                    alt="Página no encontrada"
                />
            </div>
            
            {/* Textos descriptivos, inspirados en la imagen */}
            <p className="text-2xl md:text-3xl font-bold text-red-500 mt-4">Page Not Found</p>
            <p className="text-lg text-slate-600 mt-2">
                La página que estás buscando no existe o ha sido movida.
            </p>

            {/* Botón para regresar al inicio */}
            <Link 
                to="/" 
                className="mt-10 px-6 py-3 text-center bg-gray-800 text-white border rounded-lg hover:bg-gray-700 transition-transform duration-300 hover:scale-105 shadow-md"
            >
                Regresar al Inicio
            </Link>
        </div>
    );
};