import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdClose, MdCamera, MdAttachFile, MdAdd } from 'react-icons/md';
import Webcam from 'react-webcam';
import { consultarGroqBackendCompleto } from '../../services/chatbotBackendService';
import { buscarProductosSimilares } from '../../services/productoService';
import { toast } from 'react-toastify';
import storeAuth from '../../context/storeAuth';
import './ChatModal.css';

const MAX_IMAGES = 4;

// Convierte markdown bÃ¡sico a JSX sin dependencias externas
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
    const nombres = ['algodÃ³n', 'lino', 'seda', 'poliÃ©ster', 'lana', 'nylon', 'viscosa', 'terciopelo', 'denim', 'jersey', 'satÃ©n', 'gasa', 'tul', 'encaje', 'polar', 'fleece', 'gabardina', 'tafetÃ¡n'];
    const colores = ['blanco', 'negro', 'azul', 'rojo', 'verde', 'amarillo', 'beige', 'gris', 'marrÃ³n', 'rosado', 'morado', 'naranja', 'celeste', 'crema', 'cafÃ©'];
    const texturas = ['suave', 'rugoso', 'brillante', 'opaco', 'elÃ¡stico', 'rÃ­gido', 'transpirable', 'ligero', 'pesado'];

    const nombre = nombres.find(n => lower.includes(n)) || '';
    const color = colores.find(c => lower.includes(c)) || '';
    const textura = texturas.find(t => lower.includes(t)) || '';
    return { nombre, color, textura };
};

const ChatModal = ({ onClose }) => {
    const navigate = useNavigate();
    const token = storeAuth(state => state.token);
    const rol = storeAuth(state => state.rol);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]); // array de dataURLs
    const messagesEndRef = useRef(null);
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    const productosPath = token
        ? (rol === 'vendedor' ? '/dashboard/tienda' : '/dashboard/productos')
        : '/login';

    const irAProductos = () => {
        onClose();
        navigate(productosPath);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addImages = useCallback((newImgs) => {
        setSelectedImages(prev => {
            const combined = [...prev, ...newImgs];
            if (combined.length > MAX_IMAGES) {
                toast.warn(`MÃ¡ximo ${MAX_IMAGES} imÃ¡genes por envÃ­o.`);
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
            toast.success('ðŸ“¸ Foto capturada');
        }
    }, [addImages]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const toLoad = files.slice(0, MAX_IMAGES - selectedImages.length);
        if (toLoad.length < files.length) toast.warn(`Solo se pueden agregar ${toLoad.length} imagen(es) mÃ¡s.`);

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
                    if (results.length > 0) toast.success(`ðŸ“Ž ${results.length} imagen(es) cargada(s)`);
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
            content: input.trim() || 'ðŸ“¸ Analiza estas imÃ¡genes de tela',
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

            const response = await consultarGroqBackendCompleto(
                userMessage.content,
                null,
                historial,
                imagenesBase64
            );
            const respuestaTexto = response?.respuesta || '';

            setMessages(prev => prev.map(msg =>
                msg.id === botMessageId ? { ...msg, content: respuestaTexto } : msg
            ));

            const productosBDD = response?.productosCoincidentes ?? [];
            if (productosBDD.length > 0) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    type: 'products',
                    content: 'Productos verificados en la base de datos que coinciden con el analisis:',
                    productos: productosBDD,
                    verified: true,
                }]);
                setMessages(prev => [...prev, {
                    id: Date.now() + 2,
                    role: 'assistant',
                    type: 'cta',
                    content: token
                        ? 'Puedes revisar el catalogo y continuar la compra desde productos.'
                        : 'Inicia sesion para revisar productos y agregarlos al carrito.',
                }]);
                return;
            }

            // Buscar productos similares si habÃ­a imÃ¡genes o menciÃ³n de tela
            if (imagenesSnapshot.length > 0 || userMessage.content.toLowerCase().includes('tela')) {
                try {
                    const kw = extractFabricKeywords(respuestaTexto);
                    if (kw.nombre || kw.color || kw.textura) {
                        const data = await buscarProductosSimilares(kw.nombre, kw.color, kw.textura);
                        const productos = data?.productos ?? [];
                        if (productos.length > 0) {
                            setMessages(prev => [...prev, {
                                id: Date.now() + 1,
                                role: 'assistant',
                                type: 'products',
                                content: 'ðŸ›ï¸ Productos disponibles que pueden interesarte:',
                                productos,
                            }]);
                            setMessages(prev => [...prev, {
                                id: Date.now() + 2,
                                role: 'assistant',
                                type: 'cta',
                                content: token
                                    ? 'Puedes revisar el catalogo y continuar la compra desde productos.'
                                    : 'Inicia sesion para revisar productos y agregarlos al carrito.',
                            }]);
                        }
                    }
                } catch { /* silent */ }
            }
        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.id === botMessageId
                    ? { ...msg, content: `âŒ Error: ${error.message}` }
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
                        <p>AnÃ¡lisis inteligente de telas con Groq</p>
                    </div>
                    <button onClick={onClose} className="chat-close-btn" aria-label="Cerrar chat">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages-container">
                    {messages.length === 0 && (
                        <div className="chat-welcome-message">
                            <p>Hola, soy tu asesor experto en telas.</p>
                            <p>Puedes subir hasta {MAX_IMAGES} fotos para analizar.</p>
                            <p>Cuéntame qué tela buscas o qué necesitas comparar.</p>
                            <button type="button" className="chat-cta-btn" onClick={irAProductos}>
                                {token ? 'Ver productos' : 'Iniciar sesion'}
                            </button>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`}>
                            <div className="chat-message-avatar">
                                {msg.role === 'user' ? 'ðŸ‘¤' : 'ðŸ¤–'}
                            </div>
                            <div className="chat-message-content">
                                {msg.type === 'products' ? (
                                    <>
                                        <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>{msg.content}</p>
                                        {msg.verified && (
                                            <span className="chat-verified-badge">Verificado en BDD</span>
                                        )}
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
                                                            Ver producto â†’
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : msg.type === 'cta' ? (
                                    <div className="chat-cta-card">
                                        <p>{msg.content}</p>
                                        <button type="button" className="chat-cta-btn" onClick={irAProductos}>
                                            {token ? 'Ir a productos' : 'Iniciar sesiÃ³n'}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {msg.role === 'assistant'
                                            ? <>{renderMarkdown(msg.content) || (isLoading && idx === messages.length - 1 && 'âœï¸ Pensando...')}</>
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
                            <h3>ðŸ“· Capturar foto</h3>
                            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="chat-webcam" />
                            <div className="camera-buttons">
                                <button onClick={capturePhoto} className="btn-primary">Capturar ðŸ“¸</button>
                                <button onClick={() => setShowCamera(false)} className="btn-secondary">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tira de imÃ¡genes seleccionadas */}
                {selectedImages.length > 0 && (
                    <div className="chat-images-strip">
                        {selectedImages.map((img, i) => (
                            <div key={i} className="chat-thumb-wrap">
                                <img src={img} alt={`Foto ${i + 1}`} className="chat-thumb-img" />
                                <button
                                    className="chat-thumb-remove"
                                    onClick={() => removeImage(i)}
                                    aria-label="Quitar imagen"
                                >âœ•</button>
                            </div>
                        ))}
                        {selectedImages.length < MAX_IMAGES && (
                            <button
                                className="chat-thumb-add"
                                onClick={() => fileInputRef.current.click()}
                                title="Agregar mÃ¡s imÃ¡genes"
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
                            title={`Subir imÃ¡genes (${selectedImages.length}/${MAX_IMAGES})`}
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
                        {isLoading ? 'Enviando...' : 'Enviar ðŸ“¤'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;


