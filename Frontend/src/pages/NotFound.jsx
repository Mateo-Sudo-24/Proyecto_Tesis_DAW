import { Link } from 'react-router-dom';

export const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <div className="w-80 h-80 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-300 mb-6">
                <span className="text-amber-800 font-bold text-6xl">404</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
                <p className="text-3xl md:text-4xl lg:text-5xl text-gray-800">Pagina no encontrada</p>
                <p className="md:text-lg lg:text-xl text-gray-600 mt-8">Lo sentimos mucho</p>
                <Link to="/" className="p-3 m-5 w-full text-center bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">
                    Regresar
                </Link>
            </div>
        </div>
    );
};


