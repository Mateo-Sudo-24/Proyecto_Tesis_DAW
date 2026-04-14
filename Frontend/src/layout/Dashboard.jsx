import { Link, Outlet, useLocation } from 'react-router'
import storeAuth from '../context/storeAuth'
import storeProfile from '../context/storeProfile'
import BandejaMensajes from '../components/notificaciones/BandejaMensajes'

const Dashboard = () => {
    const location = useLocation()
    const urlActual = location.pathname
    const { clearToken } = storeAuth()
    const { user } = storeProfile()

    const displayName = user?.nombre || user?.nombrePropietario || "Usuario"
    const isVendedor = user?.rol === "vendedor"
    const isCliente = user?.rol === "cliente"
    const isAdmin = user?.rol === "administrador"

    return (
        <div className='md:flex md:min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'>
            {/* Sidebar */}
            <div className='md:w-1/5 bg-gradient-to-b from-amber-900 to-amber-800 px-6 py-8 rounded-r-3xl shadow-2xl'>
                <h2 className='text-4xl font-black text-center text-orange-300 mb-2'>🧵 Intex</h2>
                <p className='text-center text-orange-200 text-xs font-semibold tracking-wider'>Admininstrador de Textiles</p>

                <img
                    src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                    alt="img-client"
                    className="m-auto mt-8 p-2 border-4 border-orange-400 rounded-full shadow-lg hover:shadow-xl transition"
                    width={130}
                    height={130}
                />
                <p className='text-orange-100 text-center my-4 text-sm font-semibold'>
                    <span className='bg-green-500 w-2.5 h-2.5 inline-block rounded-full mr-2 animate-pulse'></span>
                    {displayName}
                </p>
                <p className='text-orange-300 text-center my-2 text-xs font-bold uppercase tracking-widest bg-amber-700 rounded-full py-2'>
                    {user?.rol}
                </p>

                <ul className="mt-8 space-y-2">
                    <li>
                        <Link
                            to='/dashboard'
                            className={`block text-center py-3 rounded-lg font-bold transition duration-200 transform $
                                {urlActual === '/dashboard' 
                                    ? 'bg-orange-500 text-white shadow-lg scale-105' 
                                    : 'text-orange-100 hover:bg-amber-700 hover:text-white'}`}
                        >
                            👤 Perfil
                        </Link>
                    </li>

                    {(isVendedor || isAdmin) && (
                        <>
                            <li>
                                <Link
                                    to='/dashboard/listar'
                                    className={`block text-center py-3 rounded-lg font-bold transition duration-200 transform
                                        ${urlActual === '/dashboard/listar' 
                                            ? 'bg-orange-500 text-white shadow-lg scale-105' 
                                            : 'text-orange-100 hover:bg-amber-700 hover:text-white'}`}
                                >
                                    📋 Listar
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/dashboard/crear'
                                    className={`block text-center py-3 rounded-lg font-bold transition duration-200 transform
                                        ${urlActual === '/dashboard/crear' 
                                            ? 'bg-orange-500 text-white shadow-lg scale-105' 
                                            : 'text-orange-100 hover:bg-amber-700 hover:text-white'}`}
                                >
                                    ✨ Crear
                                </Link>
                            </li>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <li>
                                <Link
                                    to='/dashboard/productos-admin'
                                    className={`block text-center py-3 rounded-lg font-bold transition duration-200 transform
                                        ${urlActual === '/dashboard/productos-admin' 
                                            ? 'bg-orange-500 text-white shadow-lg scale-105' 
                                            : 'text-orange-100 hover:bg-amber-700 hover:text-white'}`}
                                >
                                    📦 Productos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/dashboard/notificaciones'
                                    className={`block text-center py-3 rounded-lg font-bold transition duration-200 transform
                                        ${urlActual === '/dashboard/notificaciones' 
                                            ? 'bg-orange-500 text-white shadow-lg scale-105' 
                                            : 'text-orange-100 hover:bg-amber-700 hover:text-white'}`}
                                >
                                    🔔 Notificaciones
                                </Link>
                            </li>
                        </>
                    )}

                    {isCliente && (
                        <>
                            <li>
                                <Link
                                    to='/dashboard/productos'
                                    className={`block text-center py-3 rounded-lg font-bold transition duration-200 transform
                                        ${urlActual === '/dashboard/productos' 
                                            ? 'bg-orange-500 text-white shadow-lg scale-105' 
                                            : 'text-orange-100 hover:bg-amber-700 hover:text-white'}`}
                                >
                                    🛍️ Productos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/dashboard/carrito'
                                    className={`block text-center py-3 rounded-lg font-bold transition duration-200 transform
                                        ${urlActual === '/dashboard/carrito' 
                                            ? 'bg-orange-500 text-white shadow-lg scale-105' 
                                            : 'text-orange-100 hover:bg-amber-700 hover:text-white'}`}
                                >
                                    🛒 Carrito
                                </Link>
                            </li>
                        </>
                    )}

                    <li>
                        <Link
                            to='/dashboard/chat'
                            className={`block text-center py-3 rounded-lg font-bold transition duration-200 transform
                                ${urlActual === '/dashboard/chat' 
                                    ? 'bg-orange-500 text-white shadow-lg scale-105' 
                                    : 'text-orange-100 hover:bg-amber-700 hover:text-white'}`}
                        >
                            💬 Chat
                        </Link>
                    </li>
                </ul>

                <hr className='my-6 border-amber-700'/>

                <button
                    className='w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg transition font-bold shadow-md transform hover:scale-105 duration-200'
                    onClick={() => clearToken()}
                >
                    🚪 Salir
                </button>
            </div>

            {/* Contenido principal */}
            <div className='flex-1 flex flex-col justify-between h-screen'>
                {/* Topbar */}
                <div className='bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 py-4 flex md:justify-end justify-center items-center gap-6 px-8 rounded-b-3xl shadow-2xl'>
                    <div className='text-sm font-bold text-orange-100 uppercase tracking-wider'>
                        ✨ {displayName}
                    </div>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                        alt="img-client"
                        className="border-3 border-orange-400 rounded-full shadow-lg hover:shadow-xl transition"
                        width={55}
                        height={55}
                    />
                    <BandejaMensajes />
                    <button
                        className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2 rounded-lg transition font-bold shadow-md transform hover:scale-105 duration-200'
                        onClick={() => clearToken()}
                    >
                        Salir
                    </button>
                </div>

                {/* Vista principal */}
                <div className='overflow-y-scroll p-8'>
                    <Outlet />
                </div>

                {/* Footer */}
                <div className='bg-amber-900 h-12 flex items-center justify-center'>
                    <p className='text-orange-200 font-semibold'>
                        © 2025 Intex Textiles. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
