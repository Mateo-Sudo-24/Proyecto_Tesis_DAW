import { Link, Outlet, useLocation } from 'react-router'
import storeAuth from '../context/storeAuth'
import storeProfile from '../context/storeProfile'

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
        <div className='md:flex md:min-h-screen bg-orange-50'>
            {/* Sidebar */}
            <div className='md:w-1/5 bg-amber-900 px-5 py-6 rounded-r-2xl shadow-lg'>
                <h2 className='text-3xl font-extrabold text-center text-orange-300'>Intex</h2>

                <img
                    src="https://cdn-icons-png.flaticon.com/512/2138/2138508.png"
                    alt="img-client"
                    className="m-auto mt-8 p-1 border-4 border-orange-300 rounded-full"
                    width={120}
                    height={120}
                />
                <p className='text-orange-200 text-center my-4 text-sm'>
                    <span className='bg-green-600 w-3 h-3 inline-block rounded-full'></span> Bienvenido - {displayName}
                </p>
                <p className='text-orange-200 text-center my-2 text-sm'>Rol - {user?.rol}</p>

                <ul className="mt-6 space-y-3">
                    <li>
                        <Link
                            to='/dashboard'
                            className={`block text-center py-2 rounded-lg font-semibold transition 
                                ${urlActual === '/dashboard' ? 'bg-amber-700 text-white' : 'text-orange-100 hover:bg-amber-800'}`}
                        >
                            Perfil
                        </Link>
                    </li>

                    {(isVendedor || isAdmin) && (
                        <>
                            <li>
                                <Link
                                    to='/dashboard/listar'
                                    className={`block text-center py-2 rounded-lg font-semibold transition 
                                        ${urlActual === '/dashboard/listar' ? 'bg-amber-700 text-white' : 'text-orange-100 hover:bg-amber-800'}`}
                                >
                                    Listar
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/dashboard/crear'
                                    className={`block text-center py-2 rounded-lg font-semibold transition 
                                        ${urlActual === '/dashboard/crear' ? 'bg-amber-700 text-white' : 'text-orange-100 hover:bg-amber-800'}`}
                                >
                                    Crear
                                </Link>
                            </li>
                        </>
                    )}

                    {(isCliente || isAdmin) && (
                        <>
                            <li>
                                <Link
                                    to='/dashboard/productos'
                                    className={`block text-center py-2 rounded-lg font-semibold transition 
                                        ${urlActual === '/dashboard/productos' ? 'bg-amber-700 text-white' : 'text-orange-100 hover:bg-amber-800'}`}
                                >
                                    Productos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/dashboard/carrito'
                                    className={`block text-center py-2 rounded-lg font-semibold transition 
                                        ${urlActual === '/dashboard/carrito' ? 'bg-amber-700 text-white' : 'text-orange-100 hover:bg-amber-800'}`}
                                >
                                    Carrito
                                </Link>
                            </li>
                        </>
                    )}

                    <li>
                        <Link
                            to='/dashboard/chat'
                            className={`block text-center py-2 rounded-lg font-semibold transition 
                                ${urlActual === '/dashboard/chat' ? 'bg-amber-700 text-white' : 'text-orange-100 hover:bg-amber-800'}`}
                        >
                            Chat
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Contenido principal */}
            <div className='flex-1 flex flex-col justify-between h-screen'>
                {/* Topbar */}
                <div className='bg-amber-900 py-3 flex md:justify-end justify-center items-center gap-5 px-6 rounded-b-2xl shadow-md'>
                    <div className='text-md font-semibold text-orange-200'>
                        Usuario - {displayName}
                    </div>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                        alt="img-client"
                        className="border-2 border-orange-300 rounded-full"
                        width={50}
                        height={50}
                    />
                    <button
                        className='bg-orange-300 hover:bg-orange-700 text-white px-4 py-1 rounded-lg transition'
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
