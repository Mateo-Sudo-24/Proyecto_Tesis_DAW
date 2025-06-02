import logoDarkMode from '../assets/dark.png'
import logoDogCatMain from '../assets/telamain.png'
import AppStoreImage from '../assets/appstore.png'
import GooglePlayImage from '../assets/googleplay.png'
import logoDog from '../assets/tela-pila.webp'
import { Link } from 'react-router'
import { PiTextAaBold } from "react-icons/pi";
import { LuShoppingBag } from "react-icons/lu";
import { BiRecycle } from "react-icons/bi";
import { PiChatsTeardropLight } from "react-icons/pi";
import { MdDesignServices } from "react-icons/md";
import { FaIndustry } from "react-icons/fa";
import { TbCertificate } from "react-icons/tb";
import { FaFacebook, FaSquareInstagram, FaXTwitter } from "react-icons/fa6";

export const Home = () => {
    return (
        <>
            <header className="container mx-auto h-40 text-center py-4 md:flex justify-between items-center px-4 md:h-15">
                <h1 className='font-bold text-2xl my-2 text-orange-800'>IN<span className='text-stone-900'>TEX</span></h1>
                <ul className='flex gap-5 justify-center my-4 flex-wrap'>
                    <li><a href="#" className='font-bold hover:text-orange-800 hover:underline'>Inicio</a></li>
                    <li><a href="#" className='font-bold hover:text-orange-800 hover:underline'>Nosotros</a></li>
                    <li><a href="#" className='font-bold hover:text-orange-800 hover:underline'>Productos</a></li>
                    <li><a href="#" className='font-bold hover:text-orange-800 hover:underline'>Contacto</a></li>
                </ul>
                <ul className='flex justify-center items-center gap-5 my-4'>
                    <li><img src={logoDarkMode} alt="Modo oscuro" width={35} height={35} /></li>
                </ul>
            </header>

            <main className='text-center py-6 px-8 bg-orange-50 md:text-left md:flex justify-between items-center gap-10 md:py-1'>
                <div>
                    <h1 className='font-extrabold text-orange-900 uppercase text-4xl my-4 md:text-6xl'>Diseño y calidad textil</h1>
                    <p className='font-semibold text-left my-4 md:text-xl text-orange-700 uppercase'>Con el sello de excelencia</p>
                    <p className='text-lg my-6 font-sans text-stone-700'>Especialistas en telas de alta calidad para moda, hogar e industria.</p>

                    <Link to="/login" className='block bg-orange-800 w-40 py-2 mx-auto text-white rounded-2xl text-center sm:mx-0 hover:bg-orange-700'>Explorar</Link>

                    <p className='font-bold text-left my-4 md:text-xl'>Síguenos</p>

                    <div className="flex justify-center gap-4">
                        <a href="#"><img src={AppStoreImage} alt="App Store" /></a>
                        <a href="#"><img src={GooglePlayImage} alt="Google Play" /></a>
                    </div>
                </div>
                <div className='hidden md:block'>
                    <img src={logoDogCatMain} alt="textiles premium" />
                </div>
            </main>

            <section className='container mx-auto px-4'>
                <div className='container mx-auto relative mt-6'>
                    <h2 className='font-semibold text-3xl text-center mx-auto bg-white'>NOSOTROS</h2>
                    <div className='text-orange-900 border-2 absolute top-2/2 w-full z-0' />
                </div>

                <div className='my-10 flex flex-col gap-10 items-center sm:flex-row sm:justify-around sm:items-center'>
                    <div className='sm:w-1/2'>
                        <img src={logoDog} alt="Muestra de telas" className='w-full h-full object-cover' />
                    </div>

                    <div className='px-10 sm:w-1/2 text-stone-700'>
                        <p className='my-4'>Intex es una empresa líder en textiles que combina diseño, innovación y sostenibilidad.</p>
                        <ul className='space-y-4'>
                            <li><PiTextAaBold className='inline text-2xl mr-2' />Catálogo digital interactivo</li>
                            <li><LuShoppingBag className='inline text-2xl mr-2' />Pagos seguros y flexibles</li>
                            <li><MdDesignServices className='inline text-2xl mr-2' />Consultoría en diseño online</li>
                            <li><FaIndustry className='inline text-2xl mr-2' />Innovación en procesos textiles</li>
                            <li><BiRecycle className='inline text-2xl mr-2' />Tecnología textil ecológica</li>
                            <li><TbCertificate className='inline text-2xl mr-2' />Certificación de calidad</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className='container mx-auto px-4'>
                <div className='container mx-auto relative mt-6'>
                    <h2 className='font-semibold text-3xl text-center mx-auto bg-white'>PRODUCTOS</h2>
                    <div className='text-orange-900 border-2 absolute top-2/2 w-full z-0' />
                </div>

                <div className='my-10 flex justify-between flex-wrap gap-5 text-stone-700'>
                    <div className="text-center shadow-md hover:shadow-lg transition-shadow duration-300 relative pt-4 sm:flex-1 bg-orange-50 p-4 rounded-md">
                        <FaIndustry className='inline text-4xl text-orange-800' />
                        <h4 className="text-xl font-bold py-4 text-orange-800 hover:underline">Textiles técnicos</h4>
                        <p>Materiales resistentes para uso industrial y aplicaciones especializadas.</p>
                    </div>

                    <div className="text-center shadow-md hover:shadow-lg transition-shadow duration-300 relative pt-4 sm:flex-1 bg-orange-50 p-4 rounded-md">
                        <MdDesignServices className='inline text-4xl text-orange-800' />
                        <h4 className="text-xl font-bold py-4 text-orange-800 hover:underline">Moda y confección</h4>
                        <p>Telas premium para confección, versátiles, resistentes y con estilo.</p>
                    </div>

                    <div className="text-center shadow-md hover:shadow-lg transition-shadow duration-300 relative pt-4 sm:flex-1 bg-orange-50 p-4 rounded-md">
                        <BiRecycle className='inline text-4xl text-orange-800' />
                        <h4 className="text-xl font-bold py-4 text-orange-800 hover:underline">Textiles sostenibles</h4>
                        <p>Compromiso con el medio ambiente mediante procesos ecoeficientes.</p>
                    </div>

                    <div className="text-center shadow-md hover:shadow-lg transition-shadow duration-300 relative pt-4 sm:flex-1 bg-orange-50 p-4 rounded-md">
                        <PiChatsTeardropLight className='inline text-4xl text-orange-800' />
                        <h4 className="text-xl font-bold py-4 text-orange-800 hover:underline">Atención personalizada</h4>
                        <p>Asesoría directa para elegir la tela perfecta para tu proyecto.</p>
                    </div>
                </div>
            </section>

            <footer className='text-center bg-orange-50 p-6 sm:px-20 sm:py-10 mt-20 rounded-tr-3xl rounded-tl-3xl space-y-8'>
                <div className='flex justify-between items-center'>
                    <div className='text-3xl font-extrabold text-orange-800'>Contáctanos</div>
                    <ul className='flex gap-4'>
                        <li><FaFacebook className='text-2xl' /></li>
                        <li><FaSquareInstagram className='text-2xl' /></li>
                        <li><FaXTwitter className='text-2xl' /></li>
                    </ul>
                </div>

                <div className='flex justify-between items-center flex-wrap'>
                    <div className='text-left'>
                        <p className='font-bold my-2'>Email: contacto@intex.com</p>
                        <p className='font-bold'>Teléfono: 0995644186</p>
                    </div>
                    <div className='flex-1 sm:max-w-1/2'>
                        <form action="#" className='w-full p-4'>
                            <fieldset className='border-2 border-orange-900 p-4 rounded-sm '>
                                <legend className='bg-orange-900 w-full text-left text-white pl-2 py-2'>Suscríbete al boletín</legend>
                                <div className='flex justify-between gap-4'>
                                    <input type="email" placeholder="Correo electrónico" className='sm:flex-1 border border-gray-300 rounded-md focus:outline-none px-2' />
                                    <button className='flex-1 sm:max-w-40 border bg-orange-900 p-1 rounded-lg text-white'>Enviar</button>
                                </div>
                            </fieldset>
                        </form>
                    </div>
                </div>

                <hr className='border-1 border-orange-800' />
                <p className='font-semibold'>© 2025 Intex Textiles</p>
            </footer>
        </>
    );
}
