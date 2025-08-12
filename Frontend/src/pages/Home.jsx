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
import { FaFacebook, FaSquareInstagram, FaXTwitter } from "react-icons/fa6";
import Contact from './Contact.jsx';

export const Home = () => {
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

            <main className='text-center py-6 px-8 bg-orange-50 md:text-left md:flex justify-between items-center gap-10 md:py-1'>
                <div>
                    <h1 className='font-extrabold text-orange-300 uppercase text-4xl my-4 md:text-6xl'>Diseño y calidad textil</h1>
                    <p className='font-semibold text-left my-4 md:text-xl text-orange-300 uppercase'>Con el sello de excelencia</p>
                    <p className='text-lg my-6 font-sans text-stone-700'>Especialistas en telas de alta calidad para moda, hogar e industria.</p>

                    <Link to="/login" className='block bg-orange-300 w-40 py-2 mx-auto text-white rounded-2xl text-center sm:mx-0 hover:bg-orange-700'>Explorar</Link>

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

           <section className='container mx-auto px-4 py-10'>
  <div className='flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20'>
    
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
      <h2 className='font-bold text-4xl mb-4 text-center lg:text-left text-neutral-900'>
        NOSOTROS
      </h2>

      <p className='mb-8 leading-relaxed text-center lg:text-left'>
        Intex es una empresa líder en el sector de una roteriero creatían inspiran t’tedas.
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
          <span>Tecnología textil ecológica</span>
        </li>
      </ul>
    </div>
  </div>
</section>


            <section className='container mx-auto px-4 py-14 bg-orange-50'>
  {/* Título */}
  <h2 className='text-4xl font-bold text-center text-neutral-800 mb-10'>PRODUCTOS</h2>

  {/* Tarjetas */}
  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 text-stone-800'>
    
    {/* Telas para moda */}
    <div className='bg-white p-6 rounded-md shadow hover:shadow-lg transition'>
      <MdDesignServices className='text-4xl text-orange-300 mb-4' />
      <h4 className='text-lg font-bold mb-2'>TELAS PARA MODA</h4>
      <p>Textiles premium ideales para confección, resistentes, versátiles y con diseño.</p>
    </div>

    {/* Decoración y hogar */}
    <div className='bg-white p-6 rounded-md shadow hover:shadow-lg transition'>
      <BiRecycle className='text-4xl text-orange-300 mb-4' />
      <h4 className='text-lg font-bold mb-2'>DECORACIÓN & HOGAR</h4>
      <p>Cortinas, tapicería y telas que combinan color, textura y durabilidad.</p>
    </div>

    {/* Textiles técnicos */}
    <div className='bg-white p-6 rounded-md shadow hover:shadow-lg transition'>
      <FaIndustry className='text-4xl text-orange-300 mb-4' />
      <h4 className='text-lg font-bold mb-2'>TEXTILES TÉCNICOS</h4>
      <p>Funcionales para múltiples usos innovadores e industriales.</p>
    </div>

    {/* Atención personalizada */}
    <div className='bg-white p-6 rounded-md shadow hover:shadow-lg transition'>
      <PiChatsTeardropLight className='text-4xl text-orange-300 mb-4' />
      <h4 className='text-lg font-bold mb-2'>ATENCIÓN PERSONALIZADA</h4>
      <p>Te acompañamos en la selección ideal para tu proyecto textil.</p>
    </div>
  </div>
</section>


           <footer className='bg-orange-50 p-6 sm:px-20 sm:py-12 mt-20 rounded-t-3xl space-y-10 text-stone-800'>

  {/* Título y redes */}
  <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
    <h3 className='text-3xl font-extrabold text-orange-300'>Contáctanos</h3>
    <ul className='flex gap-4 text-orange-300'>
      <li><FaFacebook className='text-2xl hover:scale-110 transition' /></li>
      <li><FaSquareInstagram className='text-2xl hover:scale-110 transition' /></li>
      <li><FaXTwitter className='text-2xl hover:scale-110 transition' /></li>
    </ul>
  </div>

  {/* Contacto y formulario */}
  <div className='flex flex-col sm:flex-row justify-between items-start gap-8'>

    {/* Info contacto */}
    <div className='sm:w-1/2'>
      <p className='font-bold mb-2'>📧 Email: contacto@intex.com</p>
      <p className='font-bold'>📞 Teléfono: 0995644186</p>
    </div>

    {/* Formulario de suscripción */}
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

  {/* Derechos reservados */}
  <p className='text-center font-semibold text-sm text-stone-600'>© 2025 Intex Textiles. Todos los derechos reservados.</p>
</footer>

        </>
    );
}
