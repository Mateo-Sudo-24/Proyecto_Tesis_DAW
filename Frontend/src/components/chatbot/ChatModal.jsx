import { useState, useRef, useEffect, useCallback } from 'react';
import { MdClose, MdCamera, MdAttachFile } from 'react-icons/md';
import Webcam from 'react-webcam';
import ollamaService from '../../services/ollamaService';
import { buscarProductosSimilares } from '../../services/productoService';
import { toast } from 'react-toastify';
import './ChatModal.css';

const ChatModal = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const messagesEndRef = useRef(null);
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setSelectedImage(imageSrc);
        setShowCamera(false);
        toast.success('📸 Foto capturada');
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('Imagen muy grande. Máximo 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                toast.success('📎 Imagen cargada');
            };
            reader.readAsDataURL(file);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() && !selectedImage) return;

        const userMessage = {
            role: 'user',
            content: input || (selectedImage ? '📸 Analiza esta imagen de tela' : ''),
            image: selectedImage
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        const botMessageId = Date.now();
        setMessages(prev => [...prev, {
            id: botMessageId,
            role: 'assistant',
            content: ''
        }]);

        try {
            const historial = messages
                .filter(m => m.role !== 'assistant' || m.content)
                .map(m => ({
                    role: m.role,
                    content: m.content
                }));

            const response = await ollamaService.consultar(
                userMessage.content,
                userMessage.image ? userMessage.image.split(',')[1] : null,
                historial
            );

            setMessages(prev => prev.map(msg =>
                msg.id === botMessageId
                    ? { ...msg, content: response }
                    : msg
            ));

            // Buscar productos si es análisis de tela
            if (selectedImage || input.includes('tela')) {
                try {
                    const jsonMatch = response.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const analysis = JSON.parse(jsonMatch[0]);
                        const productos = await buscarProductosSimilares(analysis);
                        if (productos && productos.length > 0) {
                            const productosMsg = {
                                id: Date.now(),
                                role: 'assistant',
                                content: `✨ Productos similares encontrados:\n${productos.map(p => `• ${p.nombre} - $${p.precio}`).join('\n')}`
                            };
                            setMessages(prev => [...prev, productosMsg]);
                        }
                    }
                } catch (err) {
                    console.log('No se pudieron buscar productos');
                }
            }
        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.id === botMessageId
                    ? { ...msg, content: `❌ Error: ${error.message}` }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-modal-overlay" onClick={onClose}>
            <div className="chat-modal-container" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="chat-modal-header">
                    <div>
                        <h2>🤖 Asesor de Telas IA</h2>
                        <p>Powered by Ollama | Análisis inteligente de telas</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="chat-close-btn"
                        aria-label="Cerrar chat"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages-container">
                    {messages.length === 0 && (
                        <div className="chat-welcome-message">
                            <p>✨ ¡Hola! Soy tu asesor experto en telas.</p>
                            <p>📸 Puedes subir una foto o describir la tela que buscas.</p>
                            <p>💬 ¿En qué puedo ayudarte hoy?</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`}>
                            <div className="chat-message-avatar">
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="chat-message-content">
                                {msg.content || (msg.role === 'assistant' && isLoading && '✍️ Pensando...')}
                                {msg.image && msg.role === 'user' && (
                                    <img src={msg.image} alt="Imagen compartida" style={{ maxWidth: '200px', marginTop: '8px', borderRadius: '8px' }} />
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Camera Modal */}
                {showCamera && (
                    <div className="camera-modal">
                        <div className="camera-modal-content">
                            <h3>📷 Capturar foto</h3>
                            <Webcam
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="chat-webcam"
                            />
                            <div className="camera-buttons">
                                <button onClick={capturePhoto} className="btn-primary">
                                    Capturar 📸
                                </button>
                                <button onClick={() => setShowCamera(false)} className="btn-secondary">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Preview */}
                {selectedImage && (
                    <div className="chat-image-preview">
                        <img src={selectedImage} alt="Preview" />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="btn-remove-image"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-buttons">
                        <button
                            onClick={() => setShowCamera(true)}
                            title="Capturar foto"
                            className="chat-button-action"
                        >
                            <MdCamera size={20} />
                        </button>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            title="Subir imagen"
                            className="chat-button-action"
                        >
                            <MdAttachFile size={20} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            hidden
                        />
                    </div>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu mensaje aquí... (Enter para enviar)"
                        rows="2"
                        disabled={isLoading}
                        className="chat-textarea"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || (!input.trim() && !selectedImage)}
                        className="chat-send-btn"
                    >
                        {isLoading ? 'Enviando...' : 'Enviar 📤'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
