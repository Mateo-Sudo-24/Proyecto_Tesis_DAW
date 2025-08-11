import logoDog from '../assets/isha-jain-dupe.png'
import { PiTextAaBold } from "react-icons/pi";
import { LuShoppingBag } from "react-icons/lu";
import { BiRecycle } from "react-icons/bi";
import { PiChatsTeardropLight } from "react-icons/pi";
import { MdDesignServices } from "react-icons/md";
import { FaIndustry } from "react-icons/fa";
import { TbCertificate } from "react-icons/tb";
import { Link } from 'react-router-dom'

const Nosotros = () => {
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

            <section className='container mx-auto px-4 py-10'>
                <div className='flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20'>
                    {/* Imagen */}
                    <div className='w-full lg:w-1/2'>
                        <img
                            src={logoDog}
                            alt='Equipo Intex'
                            className='w-full h-[400px] object-cover rounded-lg shadow'
                        />
                    </div>

                    {/* Texto + íconos */}
                    <div className='w-full lg:w-1/2 text-stone-700'>
                        <h2 className='font-bold text-4xl mb-4 text-center lg:text-left text-neutral-900'>
                            SOBRE NOSOTROS
                        </h2>
                        <p className='mb-8 leading-relaxed text-center lg:text-left'>
                            En <span className="text-orange-300 font-bold">Intex</span> somos una empresa ecuatoriana dedicada a la innovación y calidad en textiles para moda, hogar e industria. Nuestro compromiso es ofrecer productos resistentes, versátiles y con diseños exclusivos, siempre pensando en la satisfacción de nuestros clientes y el cuidado del medio ambiente.
                        </p>
                        <ul className='grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 text-sm'>
                            <li className='flex items-center'>
                                <PiTextAaBold className='text-2xl mr-3 text-neutral-800' />
                                <span>Catálogo digital interactivo</span>
                            </li>
                            <li className='flex items-center'>
                                <FaIndustry className='text-2xl mr-3 text-neutral-800' />
                                <span>Innovación en procesos textiles</span>
                            </li>
                            <li className='flex items-center'>
                                <LuShoppingBag className='text-2xl mr-3 text-neutral-800' />
                                <span>Pagos seguros y flexibles</span>
                            </li>
                            <li className='flex items-center'>
                                <BiRecycle className='text-2xl mr-3 text-neutral-800' />
                                <span>Tecnología textil ecológica</span>
                            </li>
                            <li className='flex items-center'>
                                <MdDesignServices className='text-2xl mr-3 text-neutral-800' />
                                <span>Consultoría en diseño online</span>
                            </li>
                            <li className='flex items-center'>
                                <TbCertificate className='text-2xl mr-3 text-neutral-800' />
                                <span>Certificaciones de calidad</span>
                            </li>
                            <li className='flex items-center'>
                                <PiChatsTeardropLight className='text-2xl mr-3 text-neutral-800' />
                                <span>Atención personalizada</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className='container mx-auto px-4 py-10'>
                <h3 className='text-3xl font-bold text-orange-300 mb-6 text-center'>Nuestra Misión</h3>
                <p className='text-lg text-center text-stone-700 mb-10 max-w-3xl mx-auto'>
                    Brindar soluciones textiles innovadoras y sostenibles, superando las expectativas de nuestros clientes a través de productos de alta calidad y un servicio personalizado.
                </p>
                <h3 className='text-3xl font-bold text-orange-300 mb-6 text-center'>Nuestra Visión</h3>
                <p className='text-lg text-center text-stone-700 max-w-3xl mx-auto'>
                    Ser líderes en el mercado textil nacional e internacional, reconocidos por nuestra excelencia, responsabilidad ambiental y compromiso con la innovación.
                </p>
            </section>
        </>
    )
}

export default Nosotros;