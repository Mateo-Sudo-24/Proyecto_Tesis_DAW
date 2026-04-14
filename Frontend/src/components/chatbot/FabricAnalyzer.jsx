import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import ollamaService from '../../services/ollamaService';
import { buscarProductosSimilares } from '../../services/productoService';
import { toast } from 'react-toastify';
import { MdCamera, MdClose, MdReplay } from 'react-icons/md';

const FabricAnalyzer = ({ onClose }) => {
    const [image, setImage] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [productosSimilares, setProductosSimilares] = useState([]);
    const [buscandoProductos, setBuscandoProductos] = useState(false);
    const webcamRef = useRef(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
    }, [webcamRef]);

    const validateImage = (file) => {
        const maxSize = 5 * 1024 * 1024;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        
        if (file.size > maxSize) {
            toast.error('Imagen muy grande. Máximo 5MB.');
            return false;
        }
        if (!validTypes.includes(file.type)) {
            toast.error('Formato inválido. Usa JPG, PNG o WebP.');
            return false;
        }
        return true;
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && validateImage(file)) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!image) {
            toast.warn('Por favor, carga una imagen primero.');
            return;
        }
        setIsLoading(true);
        setAnalysis(null);
        setRecommendations('');
        setProductosSimilares([]);

        try {
            const base64Image = image.split(',')[1];
            const response = await ollamaService.consultar(
                "Analiza la tela en esta imagen.",
                base64Image
            );
            
            if (!response) {
                throw new Error('Sin respuesta del servidor');
            }
            
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsedJson = JSON.parse(jsonMatch[0]);
                setAnalysis(parsedJson);
                
                const recommendationText = response.substring(jsonMatch[0].length).trim();
                setRecommendations(recommendationText);
                toast.success('Análisis completado.');
                
                await buscarProductosPorAnalisis(parsedJson);
            } else {
                setRecommendations(response);
                toast.warn("Análisis sin formato JSON, pero disponible.");
            }

        } catch (error) {
            console.error("Error al analizar:", error);
            if (error.message.includes('Failed to fetch') || error.message.includes('connect')) {
                toast.error('No se puede conectar con Ollama. Verifica que esté ejecutándose.');
                setRecommendations('Error: Servidor Ollama no disponible.');
            } else {
                toast.error("Error al procesar la imagen.");
                setRecommendations("Intenta con otra foto.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const buscarProductosPorAnalisis = async (analisis) => {
        setBuscandoProductos(true);
        try {
            const resultado = await buscarProductosSimilares(
                analisis.tipoTela || '',
                analisis.color || '',
                analisis.textura || ''
            );
            
            if (resultado.resultados > 0) {
                setProductosSimilares(resultado.productos);
                toast.success(`Se encontraron ${resultado.resultados} producto(s) similar(es).`);
            } else {
                setProductosSimilares([]);
                toast.info('No se encontraron productos similares.');
            }
        } catch (error) {
            console.error('Error buscando productos similares:', error);
            toast.warn('No se pudo buscar productos similares.');
        } finally {
            setBuscandoProductos(false);
        }
    };

    const reset = () => {
        setImage(null);
        setAnalysis(null);
        setRecommendations('');
        setProductosSimilares([]);
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-amber-900">Analizador de Telas</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {!image ? (
                        <div className="text-center">
                            <p className="mb-4 text-gray-600">Apunta la cámara hacia una tela o sube una foto para que la analice.</p>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full rounded-lg border"
                                videoConstraints={{ facingMode: "environment" }}
                            />
                            <button onClick={capture} className="mt-4 w-full bg-orange-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-500 transition">
                                <MdCamera size={20} /> Capturar Foto
                            </button>
                            <div className="my-4 text-gray-500">o</div>
                            <input type="file" accept="image/*" onChange={handleImageUpload} id="upload-file" className="hidden" />
                            <label htmlFor="upload-file" className="w-full block bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold cursor-pointer hover:bg-gray-300 transition">
                                Subir una foto
                            </label>
                        </div>
                    ) : (
                        <div>
                            <img src={image} alt="Captura de tela" className="w-full rounded-lg mb-4" />
                            <div className="flex gap-4 mt-6">
                                <button onClick={reset} className="w-1/2 bg-gray-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-600 transition">
                                    <MdReplay size={20} /> Otra foto
                                </button>
                                <button onClick={analyzeImage} disabled={isLoading} className="w-1/2 bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400">
                                    {isLoading ? 'Analizando...' : 'Analizar'}
                                </button>
                            </div>
                            {isLoading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mt-4"></div>}
                            {analysis && (
                                <div className="bg-amber-50 p-4 rounded-lg mt-4 border border-amber-200">
                                    <h3 className="font-bold text-amber-900 mb-2">Resultados del Análisis:</h3>
                                    <ul className="text-sm space-y-1 text-gray-700">
                                        <li><strong>Tipo:</strong> {analysis.tipoTela}</li>
                                        <li><strong>Color:</strong> {analysis.color}</li>
                                        <li><strong>Textura:</strong> {analysis.textura}</li>
                                        <li><strong>Patrón:</strong> {analysis.patron}</li>
                                        <li><strong>Confianza:</strong> {Math.round(analysis.confianza * 100)}%</li>
                                    </ul>
                                </div>
                            )}
                            {recommendations && <div className="bg-blue-50 p-4 rounded-lg mt-4"><p className="text-gray-800 whitespace-pre-wrap">{recommendations}</p></div>}
                            
                            {buscandoProductos && <div className="text-center mt-4"><p className="text-gray-600">Buscando productos similares...</p></div>}
                            
                            {productosSimilares.length > 0 && (
                                <div className="bg-green-50 p-4 rounded-lg mt-4 border border-green-200">
                                    <h3 className="font-bold text-green-900 mb-3">Productos Similares:</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {productosSimilares.map(producto => (
                                            <div key={producto._id} className="bg-white p-3 rounded border border-green-100">
                                                <p className="font-semibold text-green-900">{producto.nombre}</p>
                                                <p className="text-sm text-gray-600">{producto.descripcion}</p>
                                                <p className="text-sm font-bold text-green-700">Precio: ${producto.precio}</p>
                                                {producto.color && <p className="text-xs text-gray-500">Color: {producto.color}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FabricAnalyzer;