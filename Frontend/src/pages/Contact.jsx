import { Link } from 'react-router-dom'
import { FaFacebook, FaSquareInstagram, FaXTwitter } from "react-icons/fa6";

const Contact = () => {
    return (
        <>
            <header className="container mx-auto h-40 text-center py-4 md:flex justify-between items-center px-4 md:h-15">
                <h1 className='font-bold text-2xl my-2 text-orange-300'>IN<span className='text-stone-900'>TEX</span></h1>
                <ul className='flex gap-5 justify-center my-4 flex-wrap'>
                    <li><Link to="/" className='font-bold hover:text-orange-300 hover:underline'>Inicio</Link></li>
                    <li><Link to="/nosotros" className='font-bold hover:text-orange-300 hover:underline'>Nosotros</Link></li>
                    <li><Link to="/products" className='font-bold hover:text-orange-300 hover:underline'>Productos</Link></li>
                    <li><Link to="/contacto" className='font-bold hover:text-orange-300 hover:underline'>Contacto</Link></li>
                </ul>
                <ul className='flex justify-center items-center gap-5 my-4'>
                </ul>
            </header>

            <section className="container mx-auto px-4 py-10">
                <h2 className="text-4xl font-bold text-center text-neutral-800 mb-10">Contáctanos</h2>
                <div className="flex flex-col md:flex-row md:justify-between gap-10">
                    {/* Información de contacto */}
                    <div className="md:w-1/2 bg-white rounded-lg shadow p-8 flex flex-col justify-center mb-8 md:mb-0">
                        <h3 className="text-2xl font-bold text-orange-300 mb-4">Información</h3>
                        <p className="mb-2 font-semibold">📧 Email: <span className="font-normal">contacto@intex.com</span></p>
                        <p className="mb-2 font-semibold">📞 Teléfono: <span className="font-normal">0995644186</span></p>
                        <p className="mb-2 font-semibold">🏢 Dirección: <span className="font-normal">Av. de los Textiles S/N, Quito, Ecuador</span></p>
                        <div className="mt-6">
                            <h4 className="font-bold mb-2">Síguenos en redes:</h4>
                            <ul className="flex gap-4 text-orange-300">
                                <li><a href="#" aria-label="Facebook"><FaFacebook className="text-2xl hover:scale-110 transition" /></a></li>
                                <li><a href="#" aria-label="Instagram"><FaSquareInstagram className="text-2xl hover:scale-110 transition" /></a></li>
                                <li><a href="#" aria-label="Twitter"><FaXTwitter className="text-2xl hover:scale-110 transition" /></a></li>
                            </ul>
                        </div>
                    </div>
                    {/* Formulario de contacto */}
                    <form className="md:w-1/2 bg-white rounded-lg shadow p-8" autoComplete="off">
                        <h3 className="text-2xl font-bold text-orange-300 mb-4">Envíanos un mensaje</h3>
                        <div className="mb-4">
                            <label className="block mb-2 font-semibold">Nombre</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-orange-300"
                                placeholder="Tu nombre"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 font-semibold">Correo electrónico</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-orange-300"
                                placeholder="Tu correo"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 font-semibold">Mensaje</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-orange-300"
                                placeholder="Escribe tu mensaje"
                                rows={5}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="bg-orange-300 text-white px-6 py-2 rounded-md font-bold hover:bg-orange-400 transition w-full"
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            </section>

            <footer className='bg-orange-50 p-6 sm:px-20 sm:py-12 mt-20 rounded-t-3xl space-y-10 text-stone-800'>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <h3 className='text-3xl font-extrabold text-orange-300'>Contáctanos</h3>
                    <ul className='flex gap-4 text-orange-300'>
                        <li><FaFacebook className='text-2xl hover:scale-110 transition' /></li>
                        <li><FaSquareInstagram className='text-2xl hover:scale-110 transition' /></li>
                        <li><FaXTwitter className='text-2xl hover:scale-110 transition' /></li>
                    </ul>
                </div>
                <div className='flex flex-col sm:flex-row justify-between items-start gap-8'>
                    <div className='sm:w-1/2'>
                        <p className='font-bold mb-2'>📧 Email: contacto@intex.com</p>
                        <p className='font-bold'>📞 Teléfono: 0995644186</p>
                    </div>
                    <form action="#" className='sm:w-1/2 w-full'>
                        <fieldset className='border-2 border-orange-300 p-4 rounded-md'>
                            <legend className='bg-orange-300 text-white px-3 py-1 rounded-t-md text-sm font-medium'>
                                Suscríbete al boletín
                            </legend>
                            <div className='flex flex-col sm:flex-row gap-4 mt-2'>
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    className='flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-orange-300'
                                />
                                <button
                                    type="submit"
                                    className='bg-orange-300 text-white px-6 py-2 rounded-md hover:bg-orange-300 transition'
                                >
                                    Enviar
                                </button>
                            </div>
                        </fieldset>
                    </form>
                </div>
                <p className='text-center font-semibold text-sm text-stone-600'>© 2025 Intex Textiles. Todos los derechos reservados.</p>
            </footer>
        </>
    );
};

export default Contact;