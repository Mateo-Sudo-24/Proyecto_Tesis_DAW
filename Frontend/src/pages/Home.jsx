import logoDogCatMain from '../assets/Textured-Fabric-Display.png'
import AppStoreImage from '../assets/appstore.png'
import GooglePlayImage from '../assets/googleplay.png'
import logoDog from '../assets/isha-jain-dupe.png'
import { Link } from 'react-router-dom'
import { PiTextAaBold } from "react-icons/pi";
import { LuShoppingBag } from "react-icons/lu";
import { BiRecycle } from "react-icons/bi";
import { PiChatsTeardropLight } from "react-icons/pi";
import { MdDesignServices } from "react-icons/md";
import { FaIndustry } from "react-icons/fa";
import { TbCertificate } from "react-icons/tb";
import Contact from './Contact.jsx';

export const Home = () => {
    return (
        <>
            <header className="container mx-auto text-center py-8 md:py-10 md:flex justify-between items-center px-4 gap-6">
                <h1 className='font-bold text-4xl text-orange-300'>IN<span className='text-stone-900'>TEX</span></h1>
                <ul className='flex gap-10 justify-center my-8 md:my-0 flex-wrap'>
                    <li><Link to="/home" className='font-bold text-stone-700 hover:text-orange-300 transition text-lg'>Inicio</Link></li>
                    <li><Link to="/nosotros" className='font-bold text-stone-700 hover:text-orange-300 transition text-lg'>Nosotros</Link></li>
                    <li><Link to="/products" className='font-bold text-stone-700 hover:text-orange-300 transition text-lg'>Productos</Link></li>
                    <li><Link to="/contacto" className='font-bold text-stone-700 hover:text-orange-300 transition text-lg'>Contacto</Link></li>
                </ul>
                <div className='flex justify-center items-center gap-4 my-6 md:my-0 flex-wrap'>
                    <Link to="/login" className='font-semibold bg-orange-300 px-8 py-3 rounded-lg text-white hover:bg-orange-400 transition duration-300 shadow-md hover:shadow-lg text-base'>Inicia sesión</Link>
                    <Link to="/register" className='font-semibold bg-stone-800 px-8 py-3 rounded-lg text-white hover:bg-stone-900 transition duration-300 shadow-md hover:shadow-lg text-base'>Regístrate</Link>
                </div>
            </header>

            <main className='py-16 lg:py-24 px-6 bg-orange-50 md:flex justify-between items-center gap-16'>
                <div className='md:w-1/2 mb-12 md:mb-0'>
                    <h1 className='font-extrabold text-orange-400 uppercase text-4xl md:text-5xl mb-6'>Diseño y calidad textil</h1>
                    <p className='font-semibold text-orange-300 text-lg uppercase mb-4'>Con el sello de excelencia</p>
                    <p className='text-lg text-stone-700 mb-10 leading-relaxed'>Especialistas en telas de alta calidad para moda, hogar e industria. Entrega rápida y asesoría personalizada.</p>

                    <div className='flex gap-6 mb-10'>
                        <Link to="/login" className='flex-1 md:flex-none bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-10 rounded-lg transition duration-300 shadow-lg hover:shadow-xl text-center text-lg'>Inicia sesión</Link>
                        <Link to="/register" className='flex-1 md:flex-none bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 px-10 rounded-lg transition duration-300 shadow-lg hover:shadow-xl text-center text-lg'>Regístrate</Link>
                    </div>
                </div>
                <div className='hidden md:block md:w-1/2'>
                    <img src={logoDogCatMain} alt="textiles premium" className='w-full rounded-lg shadow-lg' />
                </div>
            </main>

           <section className='container mx-auto px-4 py-16 lg:py-24'>
  <div className='flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20'>
    
    {/* Imagen */}
    <div className='w-full lg:w-1/2'>
      <img
        src={logoDog}
        alt='Muestra de telas'
        className='w-full h-[400px] object-cover rounded-lg shadow'
      />
    </div>

    {/* Texto + íconos */}
    <div className='w-full lg:w-1/2 text-stone-700'>
      <h2 className='font-bold text-4xl md:text-5xl mb-8 text-center lg:text-left text-neutral-900'>
        NOSOTROS
      </h2>

      <p className='mb-12 leading-relaxed text-center lg:text-left text-base md:text-lg'>
        Intex es una empresa líder en el sector de una roteriero creatían inspiran t'tedas.
      </p>

      <ul className='grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 text-sm md:text-base'>
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
          <span>Tecnología textil ecológica</span>
        </li>
      </ul>
    </div>
  </div>
</section>


            <section className='container mx-auto px-4 py-16 lg:py-24 bg-orange-50'>
  {/* Título */}
  <h2 className='text-4xl md:text-5xl font-bold text-center text-neutral-800 mb-14'>PRODUCTOS</h2>

  {/* Tarjetas */}
  <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 text-stone-800'>
    
    {/* Telas para moda */}
    <div className='bg-white p-8 rounded-md shadow hover:shadow-lg transition'>
      <MdDesignServices className='text-5xl text-orange-300 mb-6' />
      <h4 className='text-xl font-bold mb-4'>TELAS PARA MODA</h4>
      <p className='text-base leading-relaxed'>Textiles premium ideales para confección, resistentes, versátiles y con diseño.</p>
    </div>

    {/* Decoración y hogar */}
    <div className='bg-white p-8 rounded-md shadow hover:shadow-lg transition'>
      <BiRecycle className='text-5xl text-orange-300 mb-6' />
      <h4 className='text-xl font-bold mb-4'>DECORACIÓN & HOGAR</h4>
      <p className='text-base leading-relaxed'>Cortinas, tapicería y telas que combinan color, textura y durabilidad.</p>
    </div>

    {/* Textiles técnicos */}
    <div className='bg-white p-8 rounded-md shadow hover:shadow-lg transition'>
      <FaIndustry className='text-5xl text-orange-300 mb-6' />
      <h4 className='text-xl font-bold mb-4'>TEXTILES TÉCNICOS</h4>
      <p className='text-base leading-relaxed'>Funcionales para múltiples usos innovadores e industriales.</p>
    </div>

    {/* Atención personalizada */}
    <div className='bg-white p-8 rounded-md shadow hover:shadow-lg transition'>
      <PiChatsTeardropLight className='text-5xl text-orange-300 mb-6' />
      <h4 className='text-xl font-bold mb-4'>ATENCIÓN PERSONALIZADA</h4>
      <p className='text-base leading-relaxed'>Te acompañamos en la selección ideal para tu proyecto textil.</p>
    </div>
  </div>
</section>


           <footer className='bg-orange-50 p-8 sm:px-20 sm:py-16 mt-24 rounded-t-3xl space-y-12 text-stone-800'>

  {/* Título y redes */}
  <div className='flex flex-col sm:flex-row justify-between items-center gap-6'>
    <h3 className='text-4xl font-extrabold text-orange-300'>Contáctanos</h3>
  </div>

  {/* Contacto y formulario */}
  <div className='flex flex-col sm:flex-row justify-between items-start gap-12'>

    {/* Info contacto */}
    <div className='sm:w-1/2'>
      <p className='font-bold mb-4 text-lg'>📧 Email: contacto@intex.com</p>
      <p className='font-bold text-lg'>📞 Teléfono: 0995644186</p>
    </div>

    {/* Formulario de suscripción */}
    <form action="#" className='sm:w-1/2 w-full'>
      <fieldset className='border-2 border-orange-300 p-6 rounded-md'>
        <legend className='bg-orange-300 text-white px-4 py-2 rounded-t-md text-base font-medium'>
          Suscríbete al boletín
        </legend>
        <div className='flex flex-col sm:flex-row gap-4 mt-4'>
          <input
            type="email"
            placeholder="Correo electrónico"
            className='flex-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-orange-300'
          />
          <button
            type="submit"
            className='bg-orange-300 text-white px-8 py-3 rounded-md hover:bg-orange-400 transition text-base font-semibold'
          >
            Enviar
          </button>
        </div>
      </fieldset>
    </form>
  </div>

  {/* Derechos reservados */}
  <p className='text-center font-semibold text-base text-stone-600 pt-8 border-t border-stone-300'>© 2025 Intex Textiles. Todos los derechos reservados.</p>
</footer>

        </>
    );
}
