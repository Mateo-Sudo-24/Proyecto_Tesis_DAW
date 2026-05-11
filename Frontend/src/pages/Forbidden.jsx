import { Link } from 'react-router-dom';

export const Forbidden = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <div className="w-80 h-80 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-300 mb-6">
                <span className="text-amber-800 font-bold text-4xl">403</span>
            </div>
            <div className="flex flex-col items-center text-center">
                <p className="text-3xl text-gray-800">Acceso denegado</p>
                <p className="text-gray-600 mt-4">No tienes permiso para ver esta pagina</p>
                <Link to="/" className="p-3 m-5 text-center bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">
                    Regresar al inicio
                </Link>
            </div>
        </div>
    );
};
