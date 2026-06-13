import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdClose, MdCamera, MdAttachFile, MdAdd, MdAutoAwesome, MdPerson, MdSend } from 'react-icons/md';
import Webcam from 'react-webcam';
import { consultarGroqBackendCompleto } from '../../services/chatbotBackendService';
import { buscarProductosSimilares } from '../../services/productoService';
import storeAuth from '../../context/storeAuth';
import './ChatModal.css';

const MAX_IMAGES = 4;

const FLUJOS = {
    info: {
        burbuja: '📍 Información de la tienda',
        mensaje: '¿Dónde están ubicados y qué servicios ofrecen?',
        siguientes: [
            '¿Cuál es el horario de atención?',
            '¿Hacen envíos a domicilio?',
            '¿Puedo ver el catálogo completo?',
        ],
    },
    productos: {
        burbuja: '🧵 Buscar un producto',
        mensaje: 'Quiero ver los productos disponibles',
        siguientes: [
            '¿Qué telas tienen en algodón?',
            '¿Tienen telas por metro y por rollo?',
            '¿Cuáles son los precios?',
        ],
    },
    preguntas: {
        burbuja: '❓ Tengo una pregunta',
        mensaje: '¿Qué puede hacer el asistente de Intex?',
        siguientes: [
            '¿Puedo subir una foto de una tela?',
            '¿Cómo hago un pedido?',
            '¿Aceptan pagos con tarjeta?',
        ],
    },
};

const normalizarTexto = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const limpiarTextoChat = (value = '') => String(value)
    .replace(/\u00f0\u0178\u201c[\u00b7\u00b8]/g, 'Foto')
    .replace(/\u00f0\u0178\u201c\u017d/g, 'Archivo')
    .replace(/\u00f0\u0178\u201c\u00a4/g, '')
    .replace(/\u00e2\u2020\u2019/g, '->')
    .replace(/\u00e2\u0153\u008d\u00ef\u00b8\u008f/g, '')
    .replace(/\u00e2\u0153\u2022/g, 'x')
    .replace(/\ufffd/g, '');

const esSaludo = (texto = '') => /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos)[!. ]*$/i.test(normalizarTexto(texto).trim());

const respuestaSaludo = (nombre = '') => {
    const nombreLimpio = limpiarTextoChat(nombre).trim();
    return `Hola${nombreLimpio ? ` ${nombreLimpio}` : ''}. Te puedo ayudar con:\n- Buscar telas por color, textura, material o uso.\n- Analizar hasta ${MAX_IMAGES} fotos de telas.\n- Recomendar productos similares del catálogo.\n- Orientarte para comprar por metros o rollos.`;
};

const obtenerNombreUsuario = () => {
    try {
        const state = JSON.parse(localStorage.getItem('auth-token'))?.state;
        return state?.nombre || state?.user?.nombre || '';
    } catch {
        return '';
    }
};

const tieneIntencionCompra = (texto = '') => {
    const t = normalizarTexto(texto);
    return /\b(comprar|compra|cotizar|cotizacion|precio|catalogo|producto|productos|carrito|quiero tela|quiero una tela|necesito tela|busco tela|ver telas|telas|reponer|reposicion|stock)\b/.test(t);
};

const pideTelaSinReferencia = (texto = '') => {
    const t = normalizarTexto(texto);
    const tieneReferenciaVaga = /\b(esta|esa|igual|parecida|similar|como esta|como esa)\b/.test(t);
    const mencionaTela = /\b(tela|tejido|material|textil)\b/.test(t);
    return mencionaTela && tieneReferenciaVaga;
};

const esConsultaTextilReconocible = (texto = '') => {
    const t = normalizarTexto(texto);
    return /\b(tela|telas|tejido|textil|algodon|lino|seda|poliester|lana|nylon|viscosa|rayon|terciopelo|denim|jean|jersey|saten|gasa|tul|encaje|polar|fleece|gabardina|tafetan|lycra|spandex|microfibra|loneta|popelina|organza|color|textura|metro|rollo|comprar|precio|catalogo|carrito|reponer|reposicion|stock)\b/.test(t);
};

// Convierte markdown básico a JSX sin dependencias externas.
const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = limpiarTextoChat(text).split('\n');
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

// Extrae palabras clave de telas de la respuesta de la IA.
const extractFabricKeywords = (text) => {
    const lower = normalizarTexto(limpiarTextoChat(text));
    const nombres = ['algodón', 'lino', 'seda', 'poliéster', 'lana', 'nylon', 'viscosa', 'terciopelo', 'denim', 'jersey', 'satén', 'gasa', 'tul', 'encaje', 'polar', 'fleece', 'gabardina', 'tafetán'];
    const colores = ['blanco', 'negro', 'azul', 'rojo', 'verde', 'amarillo', 'beige', 'gris', 'marrón', 'rosado', 'morado', 'naranja', 'celeste', 'crema', 'café'];
    const texturas = ['suave', 'rugoso', 'brillante', 'opaco', 'elástico', 'rígido', 'transpirable', 'ligero', 'pesado'];

    const nombre = nombres.find(n => lower.includes(normalizarTexto(n))) || '';
    const color = colores.find(c => lower.includes(normalizarTexto(c))) || '';
    const textura = texturas.find(t => lower.includes(normalizarTexto(t))) || '';
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
    const [productIntentCount, setProductIntentCount] = useState(0);
    const [burbujasActivas, setBurbujasActivas] = useState([]);
    const [mostrarBurbujas, setMostrarBurbujas] = useState(true);
    const [tituloImagen, setTituloImagen] = useState('');
    const [descripcionImagen, setDescripcionImagen] = useState('');
    const messagesEndRef = useRef(null);
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    const productosPath = token
        ? (rol === 'vendedor' ? '/dashboard/tienda' : '/dashboard/productos')
        : '/products';

    const irAProductos = () => {
        onClose();
        navigate(productosPath);
    };

    const crearCtaProgresivo = (id) => ({
        id,
        role: 'assistant',
        type: 'cta',
        content: token
            ? 'Ya tengo suficiente contexto. Te dejo un acceso directo para revisar productos relacionados.'
            : 'Ya tengo suficiente contexto. Puedes revisar productos en /products; si decides comprar, el sistema te llevará a iniciar sesión.',
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addImages = useCallback((newImgs) => {
        setSelectedImages(prev => {
            const combined = [...prev, ...newImgs];
            if (combined.length > MAX_IMAGES) {
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
        }
    }, [addImages]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const toLoad = files.slice(0, MAX_IMAGES - selectedImages.length);

        const results = [];
        let done = 0;
        for (const file of toLoad) {
            if (file.size > 5 * 1024 * 1024) { done++; continue; }
            const reader = new FileReader();
            reader.onloadend = () => {
                results.push(reader.result);
                done++;
                if (done === toLoad.length) {
                    addImages(results.filter(Boolean));
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const removeImage = (idx) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== idx));
    };

    const sendMessage = async ({ mensaje = null, siguientes = null } = {}) => {
        const textoEntrada = typeof mensaje === 'string' ? mensaje : input.trim();
        if (!textoEntrada.trim() && selectedImages.length === 0) return;
        if (!mensaje) setBurbujasActivas([]);

        const imagenesSnapshot = [...selectedImages];
        const mensajeConContexto = imagenesSnapshot.length > 0 && tituloImagen.trim()
            ? `${tituloImagen.trim()}${descripcionImagen.trim() ? ': ' + descripcionImagen.trim() : ''}${textoEntrada.trim() ? '. ' + textoEntrada.trim() : ''}`
            : textoEntrada.trim() || '📸 Analiza esta imagen de tela';
        const userMessage = {
            role: 'user',
            content: mensajeConContexto,
            images: imagenesSnapshot,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setSelectedImages([]);
        setTituloImagen('');
        setDescripcionImagen('');
        if (siguientes) setBurbujasActivas(siguientes);
        setIsLoading(true);

        const botMessageId = Date.now();
        const textoNormalizado = normalizarTexto(userMessage.content);
        const tieneImagenes = imagenesSnapshot.length > 0;

        if (!tieneImagenes && esSaludo(userMessage.content)) {
            setMessages(prev => [
                ...prev,
                {
                    id: botMessageId,
                    role: 'assistant',
                    content: respuestaSaludo(obtenerNombreUsuario()),
                },
            ]);
            setIsLoading(false);
            return;
        }

        const esIntencionProducto = tieneIntencionCompra(userMessage.content) || pideTelaSinReferencia(userMessage.content);
        const nextProductIntentCount = esIntencionProducto ? productIntentCount + 1 : productIntentCount;
        if (esIntencionProducto) setProductIntentCount(nextProductIntentCount);
        const mostrarCtaProductos = nextProductIntentCount > 4;

        if (!tieneImagenes && pideTelaSinReferencia(userMessage.content)) {
            setMessages(prev => {
                const respuestas = [
                    ...prev,
                    {
                        id: botMessageId,
                        role: 'assistant',
                        content: 'Soy Intex IA, tu asesor textil. Puedo ayudarte aunque no tengas foto: dime color, textura, uso de la tela, si la necesitas por metro o rollo, y buscaré coincidencias o alternativas del catálogo.',
                    },
                ];
                if (mostrarCtaProductos) respuestas.push(crearCtaProgresivo(botMessageId + 1));
                return respuestas;
            });
            setIsLoading(false);
            return;
        }

        if (!tieneImagenes && tieneIntencionCompra(userMessage.content) && !/(analiza|identifica|reconoce|compara|que tela|cual tela)/.test(textoNormalizado)) {
            setMessages(prev => {
                const respuestas = [
                    ...prev,
                    {
                        id: botMessageId,
                        role: 'assistant',
                        content: 'Soy Intex IA. Puedo orientarte por color, material, textura, uso y disponibilidad. Cuéntame qué tela buscas, por ejemplo: "algodón blanco para camisas", "tela negra elástica" o "rollos de poliéster".',
                    },
                ];
                if (mostrarCtaProductos) respuestas.push(crearCtaProgresivo(botMessageId + 1));
                return respuestas;
            });
            setIsLoading(false);
            return;
        }

        if (!tieneImagenes && userMessage.content.trim().length > 0 && !esConsultaTextilReconocible(userMessage.content)) {
            setMessages(prev => [
                ...prev,
                {
                    id: botMessageId,
                    role: 'assistant',
                    content: 'No logré relacionar tu mensaje con telas o productos textiles. Puedes preguntarme por tipos de tela, colores, texturas, usos, precios, o subir una foto para analizarla.',
                },
            ]);
            setIsLoading(false);
            return;
        }

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

            const productosCoincidentes = response?.productosCoincidentes ?? [];
            if (productosCoincidentes.length > 0) {
                const tipoRecomendacion = response?.tipoRecomendacion;
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    type: 'products',
                    content: tipoRecomendacion === 'general'
                        ? 'No encontré una coincidencia exacta en nuestros productos. Te recomendamos estas alternativas disponibles:'
                        : tipoRecomendacion === 'imagen_similar'
                            ? 'Productos con imagen disponible que se parecen al análisis de tu foto:'
                            : 'Productos verificados en nuestros productos que coinciden con el análisis:',
                    productos: productosCoincidentes,
                    verified: tipoRecomendacion !== 'general',
                    tipoRecomendacion,
                }]);
                if (mostrarCtaProductos) {
                    setMessages(prev => [...prev, crearCtaProgresivo(Date.now() + 2)]);
                }
                return;
            }

            // Buscar productos similares si había imágenes o mención de tela.
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
                                content: 'Productos disponibles que pueden interesarte:',
                                productos,
                            }]);
                            if (mostrarCtaProductos) {
                                setMessages(prev => [...prev, crearCtaProgresivo(Date.now() + 2)]);
                            }
                        }
                    }
                } catch { /* silent */ }
            }
        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.id === botMessageId
                    ? { ...msg, content: 'No pude completar el análisis en este momento. Intenta describir la tela con color, textura y uso, o adjunta una foto para revisarla mejor.' }
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

    const handleBurbujaPredefinida = async (flujo) => {
        setMostrarBurbujas(false);
        await sendMessage({ mensaje: flujo.mensaje, siguientes: flujo.siguientes });
    };

    return (
        <div className="chat-modal-overlay" onClick={onClose}>
            <div className="chat-modal-container" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="chat-modal-header">
                    <div>
                        <h2>Asesor de Telas IA</h2>
                        <p>Análisis inteligente de telas</p>
                    </div>
                    <button onClick={onClose} className="chat-close-btn" aria-label="Cerrar chat">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages-container">
                    {messages.length === 0 && mostrarBurbujas && (
                        <div className="chat-welcome-message">
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧵</div>
                            <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 0.35rem' }}>
                                Hola, soy <strong>Intex IA</strong>
                            </p>
                            <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 1.25rem' }}>
                                Tu asesor experto en telas. ¿En qué puedo ayudarte hoy?
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {Object.values(FLUJOS).map((flujo, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleBurbujaPredefinida(flujo)}
                                        style={{
                                            background: '#fff',
                                            border: '1.5px solid #e8760a',
                                            borderRadius: '1.5rem',
                                            padding: '0.6rem 1rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: '#c4620a',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fde8ce'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        {flujo.burbuja}
                                    </button>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.875rem', textAlign: 'center', lineHeight: 1.5 }}>
                                📸 Puedes subir una foto de tela con un título y descripción<br />
                                para identificarla y encontrar productos similares
                            </p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`}>
                            <div className="chat-message-avatar">
                                {msg.role === 'user' ? <MdPerson size={17} /> : <MdAutoAwesome size={17} />}
                            </div>
                            <div className="chat-message-content">
                                {msg.type === 'products' ? (
                                    <>
                                        <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>{limpiarTextoChat(msg.content)}</p>
                                        {msg.tipoRecomendacion === 'imagen_similar' ? (
                                            <span className="chat-verified-badge">Coincidencia por imagen similar</span>
                                        ) : msg.verified && (
                                            <span className="chat-verified-badge">Verificado en nuestros productos</span>
                                        )}
                                        <div className="chat-products-grid">
                                            {msg.productos.map((p, i) => (
                                                <div key={i} className="chat-product-card">
                                                    {p.imagenUrl && (
                                                        <img
                                                            src={p.imagenUrl}
                                                            alt={limpiarTextoChat(p.nombre)}
                                                            className="chat-product-img"
                                                            onError={e => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    <div className="chat-product-info">
                                                        <span className="chat-product-name">{limpiarTextoChat(p.nombre)}</span>
                                                        <span className="chat-product-price">
                                                            Metro: ${Number(p.precioPorMetro || 0).toFixed(2)}
                                                            {Number(p.precioPorRollo || 0) > 0 && ` / Rollo: $${Number(p.precioPorRollo || 0).toFixed(2)}`}
                                                        </span>
                                                        <Link
                                                            to={`/products/${p._id}`}
                                                            className="chat-product-btn"
                                                            onClick={onClose}
                                                        >
                                                            Ver producto
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : msg.type === 'cta' ? (
                                    <div className="chat-cta-card">
                                        <p>{limpiarTextoChat(msg.content)}</p>
                                        <button type="button" className="chat-cta-btn" onClick={irAProductos}>
                                            Ir a productos
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {msg.role === 'assistant'
                                            ? <>{renderMarkdown(msg.content) || (isLoading && idx === messages.length - 1 && 'Pensando...')}</>
                                            : limpiarTextoChat(msg.content)
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
                    {burbujasActivas.length > 0 && !isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.5rem 0', marginTop: '0.25rem' }}>
                            {burbujasActivas.map((pregunta, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setBurbujasActivas([]);
                                        sendMessage({ mensaje: pregunta });
                                    }}
                                    style={{
                                        background: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '1rem',
                                        padding: '0.4rem 0.85rem',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        color: '#374151',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = '#e8760a'; e.currentTarget.style.color = '#c4620a'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
                                >
                                    {pregunta}
                                </button>
                            ))}
                        </div>
                    )}
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
                                >x</button>
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

                {selectedImages.length > 0 && (
                    <div style={{ padding: '0.5rem 1rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <input
                            type="text"
                            placeholder="Título de la tela (ej: Tela azul para tapicería)"
                            value={tituloImagen}
                            onChange={e => setTituloImagen(e.target.value)}
                            style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.45rem 0.75rem', fontSize: '0.82rem', outline: 'none' }}
                        />
                        <textarea
                            placeholder="Descripción opcional (color, uso, material)"
                            value={descripcionImagen}
                            onChange={e => setDescripcionImagen(e.target.value)}
                            rows={2}
                            style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.45rem 0.75rem', fontSize: '0.82rem', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                )}

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-buttons">
                        <button
                            onClick={() => setShowCamera(true)}
                            title="📷 Capturar foto"
                            className="chat-button-action"
                            disabled={selectedImages.length >= MAX_IMAGES}
                        >
                            <MdCamera size={20} />
                        </button>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            title={`📎 Subir imágenes (${selectedImages.length}/${MAX_IMAGES})`}
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
                        placeholder="Escribe tu consulta o sube una foto de tela... (Enter para enviar)"
                        rows="2"
                        disabled={isLoading}
                        className="chat-textarea"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
                        className="chat-send-btn"
                    >
                        {isLoading ? 'Enviando...' : <><span>Enviar</span><MdSend size={16} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
