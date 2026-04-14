import { useState } from 'react';
import useAuthStore from '../../context/storeAuth';
import { FaCamera } from "react-icons/fa";
import FabricAnalyzer from './FabricAnalyzer';

const ChatbotBubble = () => {
    const { rol } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (rol !== 'cliente') {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                aria-label="Analizar tela con una foto"
                className="
                    fixed bottom-5 right-5 w-16 h-16 bg-orange-400 text-white
                    rounded-full flex items-center justify-center shadow-lg
                    cursor-pointer z-50 transform transition-all duration-300
                    hover:bg-orange-500 hover:scale-110
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400
                "
            >
                <FaCamera size={28} />
            </button>

            {isModalOpen && <FabricAnalyzer onClose={() => setIsModalOpen(false)} />}
        </>
    );
}

export default ChatbotBubble;