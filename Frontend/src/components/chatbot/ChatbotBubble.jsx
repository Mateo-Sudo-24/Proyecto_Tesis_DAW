import { useEffect, useState } from 'react';
import useAuthStore from '../../context/storeAuth';
import { PiChatsTeardropLight } from "react-icons/pi";

const ChatbotBubble = () => {
  const { token } = useAuthStore();
  const [isBotReady, setIsBotReady] = useState(false);

  useEffect(() => {
    // La inicialización ahora es manejada por el script externo.
    // Nosotros solo necesitamos esperar a que el bot esté listo.
    
    // Función para manejar el evento de que el bot está listo
    const handleBotReady = () => {
      console.log('Botpress Web Chat v3 está listo.');
      setIsBotReady(true);
      
      // Si hay un token, se lo enviamos ahora
      if (token) {
        window.botpressWebChat.sendPayload({
          type: 'user_authenticated',
          payload: { token }
        });
      }
    };
    
    // El script de Botpress v3 emite un evento personalizado en 'window' cuando está listo.
    // Escuchamos ese evento.
    window.addEventListener('botpress-webchat-ready', handleBotReady);

    // Función de limpieza: eliminamos el listener cuando el componente se desmonta
    // para evitar fugas de memoria.
    return () => {
      window.removeEventListener('botpress-webchat-ready', handleBotReady);
    };

  }, [token]); // El efecto se vuelve a ejecutar si el token cambia

  // La función que se ejecuta al hacer clic en la burbuja
  const handleClick = () => {
    // Con v3, el método para abrir/cerrar es más simple
    if (isBotReady && window.botpressWebChat) {
        window.botpressWebChat.toggle();
    }
  };

  // Renderizamos la burbuja solo cuando el bot está completamente listo
  if (!isBotReady) {
    return null; 
  }

  return (
    <button
        onClick={handleClick}
        aria-label="Abrir chat de asistencia"
        className="
            fixed bottom-5 right-5 w-16 h-16 bg-orange-400 text-white
            rounded-full flex items-center justify-center shadow-lg
            cursor-pointer z-50 transform transition-all duration-300
            hover:bg-orange-500 hover:scale-110
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400
        "
    >
        <PiChatsTeardropLight size={32} />
    </button>
  );
}

export default ChatbotBubble;