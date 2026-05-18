import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MdClose, MdCamera, MdAttachFile, MdAdd } from 'react-icons/md';
import Webcam from 'react-webcam';
import { consultarGroqBackend } from '../../services/chatbotBackendService';
import { buscarProductosSimilares } from '../../services/productoService';
import { toast } from 'react-toastify';
import './ChatModal.css';

const MAX_IMAGES = 4;

// Convierte markdown básico a JSX sin dependencias externas
const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
        const isBullet = /^[\*\-]\s/.test(line);
        const content = isBullet ? line.replace(/^[\*\-]\s/, '') : line;

        const parseInline = (str) => {
            const parts = [];
            const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
            let last = 0, m;
            while ((m = regex.exec(str)) !== null) {
                if (m.index > last) parts.push(str.slice(last, m.index));
                if (m[1]) parts.push(<strong key={m.index}><em>{m[1]}</em></strong>);
                else if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
                else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
                last = regex.lastIndex;
            }
            if (last < str.length) parts.push(str.slice(last));
            return parts.length ? parts : str;
        };

        if (isBullet) return <li key={i} style={{ marginLeft: '1rem', listStyleType: 'disc' }}>{parseInline(content)}</li>;
        if (!line.trim()) return <br key={i} />;
        return <p key={i} style={{ margin: '0.2rem 0' }}>{parseInline(line)}</p>;
    });
};

// Extrae palabras clave de telas de la respuesta de la IA
const extractFabricKeywords = (text) => {
    const lower = text.toLowerCase();
    const nombres = ['algodón', 'lino', 'seda', 'poliéster', 'lana', 'nylon', 'viscosa', 'terciopelo', 'denim', 'jersey', 'satén', 'gasa', 'tul', 'encaje', 'polar', 'fleece', 'gabardina', 'tafetán'];
    const colores = ['blanco', 'negro', 'azul', 'rojo', 'verde', 'amarillo', 'beige', 'gris', 'marrón', 'rosado', 'morado', 'naranja', 'celeste', 'crema', 'café'];
    const texturas = ['suave', 'rugoso', 'brillante', 'opaco', 'elástico', 'rígido', 'transpirable', 'ligero', 'pesado'];

    const nombre = nombres.find(n => lower.includes(n)) || '';
    const color = colores.find(c => lower.includes(c)) || '';
    const textura = texturas.find(t => lower.includes(t)) || '';
    return { nombre, color, textura };
};

const ChatModal = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]); // array de dataURLs
    const messagesEndRef = useRef(null);
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addImages = useCallback((newImgs) => {
        setSelectedImages(prev => {
            const combined = [...prev, ...newImgs];
            if (combined.length > MAX_IMAGES) {
                toast.warn(`Máximo ${MAX_IMAGES} imágenes por envío.`);
                return combined.slice(0, MAX_IMAGES);
            }
            return combined;
        });
    }, []);

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            addImages([imageSrc]);
            setShowCamera(false);
            toast.success('📸 Foto capturada');
        }
    }, [addImages]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const toLoad = files.slice(0, MAX_IMAGES - selectedImages.length);
        if (toLoad.length < files.length) toast.warn(`Solo se pueden agregar ${toLoad.length} imagen(es) más.`);

        const results = [];
        let done = 0;
        for (const file of toLoad) {
            if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} supera 5 MB.`); done++; continue; }
            const reader = new FileReader();
            reader.onloadend = () => {
                results.push(reader.result);
                done++;
                if (done === toLoad.length) {
                    addImages(results.filter(Boolean));
                    if (results.length > 0) toast.success(`📎 ${results.length} imagen(es) cargada(s)`);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const removeImage = (idx) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== idx));
    };

    const sendMessage = async () => {
        if (!input.trim() && selectedImages.length === 0) return;

        const imagenesSnapshot = [...selectedImages];
        const userMessage = {
            role: 'user',
            content: input.trim() || '📸 Analiza estas imágenes de tela',
            images: imagenesSnapshot,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setSelectedImages([]);
        setIsLoading(true);

        const botMessageId = Date.now();
        setMessages(prev => [...prev, { id: botMessageId, role: 'assistant', content: '' }]);

        try {
            const historial = messages
                .filter(m => m.role !== 'assistant' || m.content)
                .map(m => ({ role: m.role, content: m.content }));

            // Extraer base64 sin el prefijo dataURL
            const imagenesBase64 = imagenesSnapshot.map(img => img.split(',')[1]).filter(Boolean);

            const response = await consultarGroqBackend(
                userMessage.content,
                null,
                historial,
                imagenesBase64
            );

            setMessages(prev => prev.map(msg =>
                msg.id === botMessageId ? { ...msg, content: response } : msg
            ));

            // Buscar productos similares si había imágenes o mención de tela
            if (imagenesSnapshot.length > 0 || userMessage.content.toLowerCase().includes('tela')) {
                try {
                    const kw = extractFabricKeywords(response);
                    if (kw.nombre || kw.color || kw.textura) {
                        const data = await buscarProductosSimilares(kw.nombre, kw.color, kw.textura);
                        const productos = data?.productos ?? [];
                        if (productos.length > 0) {
                            setMessages(prev => [...prev, {
                                id: Date.now() + 1,
                                role: 'assistant',
                                type: 'products',
                                content: '🛍️ Productos disponibles que pueden interesarte:',
                                productos,
                            }]);
                        }
                    }
                } catch { /* silent */ }
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
                        <h2>Asesor de Telas IA</h2>
                        <p>Análisis inteligente de telas con Groq</p>
                    </div>
                    <button onClick={onClose} className="chat-close-btn" aria-label="Cerrar chat">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages-container">
                    {messages.length === 0 && (
                        <div className="chat-welcome-message">
                            <p>✨ ¡Hola! Soy tu asesor experto en telas.</p>
                            <p>📸 Puedes subir hasta {MAX_IMAGES} fotos para analizar.</p>
                            <p>💬 ¿En qué puedo ayudarte hoy?</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`}>
                            <div className="chat-message-avatar">
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="chat-message-content">
                                {msg.type === 'products' ? (
                                    <>
                                        <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>{msg.content}</p>
                                        <div className="chat-products-grid">
                                            {msg.productos.map((p, i) => (
                                                <div key={i} className="chat-product-card">
                                                    {p.imagenUrl && (
                                                        <img
                                                            src={p.imagenUrl}
                                                            alt={p.nombre}
                                                            className="chat-product-img"
                                                            onError={e => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    <div className="chat-product-info">
                                                        <span className="chat-product-name">{p.nombre}</span>
                                                        <span className="chat-product-price">${Number(p.precio || 0).toFixed(2)}</span>
                                                        <Link
                                                            to={`/products/${p._id}`}
                                                            className="chat-product-btn"
                                                            onClick={onClose}
                                                        >
                                                            Ver producto →
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {msg.role === 'assistant'
                                            ? <>{renderMarkdown(msg.content) || (isLoading && idx === messages.length - 1 && '✍️ Pensando...')}</>
                                            : msg.content
                                        }
                                        {msg.images?.length > 0 && (
                                            <div className="chat-message-imgs">
                                                {msg.images.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt={`Imagen ${i + 1}`}
                                                        className="chat-message-img-thumb"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
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
                            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="chat-webcam" />
                            <div className="camera-buttons">
                                <button onClick={capturePhoto} className="btn-primary">Capturar 📸</button>
                                <button onClick={() => setShowCamera(false)} className="btn-secondary">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tira de imágenes seleccionadas */}
                {selectedImages.length > 0 && (
                    <div className="chat-images-strip">
                        {selectedImages.map((img, i) => (
                            <div key={i} className="chat-thumb-wrap">
                                <img src={img} alt={`Foto ${i + 1}`} className="chat-thumb-img" />
                                <button
                                    className="chat-thumb-remove"
                                    onClick={() => removeImage(i)}
                                    aria-label="Quitar imagen"
                                >✕</button>
                            </div>
                        ))}
                        {selectedImages.length < MAX_IMAGES && (
                            <button
                                className="chat-thumb-add"
                                onClick={() => fileInputRef.current.click()}
                                title="Agregar más imágenes"
                            >
                                <MdAdd size={22} />
                            </button>
                        )}
                    </div>
                )}

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-buttons">
                        <button
                            onClick={() => setShowCamera(true)}
                            title="Capturar foto"
                            className="chat-button-action"
                            disabled={selectedImages.length >= MAX_IMAGES}
                        >
                            <MdCamera size={20} />
                        </button>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            title={`Subir imágenes (${selectedImages.length}/${MAX_IMAGES})`}
                            className="chat-button-action"
                            disabled={selectedImages.length >= MAX_IMAGES}
                        >
                            <MdAttachFile size={20} />
                            {selectedImages.length > 0 && (
                                <span className="chat-img-badge">{selectedImages.length}</span>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            hidden
                        />
                    </div>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu consulta... (Enter para enviar)"
                        rows="2"
                        disabled={isLoading}
                        className="chat-textarea"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
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


// Convierte markdown básico a JSX sin dependencias externas
const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Línea de lista
        const isBullet = /^[\*\-]\s/.test(line);
        const content = isBullet ? line.replace(/^[\*\-]\s/, '') : line;

        // Parsear negrilla e itálica inline
        const parseInline = (str) => {
            const parts = [];
            const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
            let last = 0, m;
            while ((m = regex.exec(str)) !== null) {
                if (m.index > last) parts.push(str.slice(last, m.index));
                if (m[1]) parts.push(<strong key={m.index}><em>{m[1]}</em></strong>);
                else if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
                else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
                last = regex.lastIndex;
            }
            if (last < str.length) parts.push(str.slice(last));
            return parts.length ? parts : str;
        };

        if (isBullet) {
            return <li key={i} style={{ marginLeft: '1rem', listStyleType: 'disc' }}>{parseInline(content)}</li>;
        }
        if (!line.trim()) return <br key={i} />;
        return <p key={i} style={{ margin: '0.2rem 0' }}>{parseInline(line)}</p>;
    });
};

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

            const response = await consultarGroqBackend(
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
                        <h2>Asesor de Telas IA</h2>
                        <p>Análisis inteligente de telas con Groq</p>
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
                                {msg.role === 'assistant'
                                    ? <>{renderMarkdown(msg.content) || (isLoading && '✍\uFE0F Pensando...')}</>
                                    : msg.content
                                }
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
