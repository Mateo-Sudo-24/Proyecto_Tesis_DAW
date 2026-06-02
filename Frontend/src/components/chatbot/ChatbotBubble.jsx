import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatModal from './ChatModal';
import chatIcon from '../../assets/cutting.png';

const ChatbotBubble = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    // No mostrar en rutas de autenticacion
    const rutasOcultas = ['/login', '/register', '/forgot', '/reset', '/confirm', '/setup-account', '/oauth-success'];
    const debeOcultar = rutasOcultas.some(ruta => location.pathname.includes(ruta));

    if (debeOcultar) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                aria-label="Abrir asistente de Intex"
                className="
                    fixed bottom-5 right-5 w-16 h-16 bg-gray-500 text-white
                    rounded-full flex items-center justify-center shadow-lg
                    cursor-pointer z-50 transform transition-all duration-300
                    hover:bg-gray-900 hover:scale-110
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700
                "
                title="Asesor de Intex - Análisis de Telas con IA"
            >
                <img src={chatIcon} alt="Asistente Intex" className="w-9 h-9 object-contain" />
            </button>

            {isModalOpen && <ChatModal onClose={() => setIsModalOpen(false)} />}
        </>
    );
}

export default ChatbotBubble;

