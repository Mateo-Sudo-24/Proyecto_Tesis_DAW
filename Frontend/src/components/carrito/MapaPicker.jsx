// import { useRef, useState, useCallback } from 'react';
// import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';

// const LIBRARIES = ['places'];
// const MAP_CENTER_DEFAULT = { lat: -2.1894, lng: -79.8891 }; // Guayaquil

const mapStyles = `
    .mapa-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 1rem;
    }
    .mapa-modal {
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 24px 60px rgba(0,0,0,0.25);
        width: 100%;
        max-width: 680px;
        max-height: 92vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: mapa-in 0.2s ease;
    }
    @keyframes mapa-in {
        from { opacity: 0; transform: scale(0.95) translateY(14px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .mapa-header {
        background: #1f2937;
        padding: 1.1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 1.25rem 1.25rem 0 0;
        flex-shrink: 0;
    }
    .mapa-header h2 {
        font-size: 1rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .mapa-close-btn {
        background: rgba(255,255,255,0.08);
        border: none;
        color: #9ca3af;
        cursor: pointer;
        border-radius: 0.375rem;
        padding: 0.3rem 0.6rem;
        font-size: 1.1rem;
        transition: background 0.12s, color 0.12s;
    }
    .mapa-close-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .mapa-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; padding: 1rem 1.25rem; gap: 0.875rem; }
    .mapa-search-wrap { position: relative; }
    .mapa-search-input {
        width: 100%;
        padding: 0.65rem 1rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.75rem;
        font-size: 0.9rem;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .mapa-search-input:focus {
        border-color: #e8760a;
        box-shadow: 0 0 0 3px rgba(232,118,10,0.12);
    }
    .mapa-hint { font-size: 0.78rem; color: #6b7280; margin: 0; }
    .mapa-container { flex: 1; min-height: 320px; border-radius: 0.875rem; overflow: hidden; border: 1.5px solid #e5e7eb; }
    .mapa-selected-addr {
        background: #f0fdf4;
        border: 1.5px solid #86efac;
        border-radius: 0.75rem;
        padding: 0.65rem 1rem;
        font-size: 0.875rem;
        color: #166534;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .mapa-no-addr {
        background: #fafaf9;
        border: 1.5px dashed #e5e7eb;
        border-radius: 0.75rem;
        padding: 0.65rem 1rem;
        font-size: 0.82rem;
        color: #9ca3af;
        text-align: center;
    }
    .mapa-footer {
        flex-shrink: 0;
        padding: 0.875rem 1.25rem;
        border-top: 1px solid #f3f4f6;
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
    }
    .mapa-btn-cancel {
        padding: 0.6rem 1.25rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.625rem;
        background: #fff;
        color: #374151;
        font-weight: 700;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.12s;
    }
    .mapa-btn-cancel:hover { background: #f3f4f6; }
    .mapa-btn-accept {
        padding: 0.6rem 1.5rem;
        border: none;
        border-radius: 0.625rem;
        background: #e8760a;
        color: #fff;
        font-weight: 700;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.12s, transform 0.1s;
        box-shadow: 0 3px 10px rgba(232,118,10,0.28);
    }
    .mapa-btn-accept:hover:not(:disabled) { background: #c4620a; transform: translateY(-1px); }
    .mapa-btn-accept:disabled { opacity: 0.45; cursor: not-allowed; }
    .mapa-loading { display: flex; align-items: center; justify-content: center; min-height: 400px; color: #6b7280; font-size: 0.9rem; gap: 0.5rem; }
`;

const MapaPicker = ({ onSelect, onClose }) => {
    // const { isLoaded, loadError } = useJsApiLoader({
    //     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    //     libraries: LIBRARIES,
    // });

    // const [marker, setMarker] = useState(null);
    // const [address, setAddress] = useState('');
    // const [center, setCenter] = useState(MAP_CENTER_DEFAULT);
    // const autocompleteRef = useRef(null);

    // const handleMapClick = useCallback((e) => {
    //     const lat = e.latLng.lat();
    //     const lng = e.latLng.lng();
    //     setMarker({ lat, lng });
    //     const geocoder = new window.google.maps.Geocoder();
    //     geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    //         if (status === 'OK' && results[0]) {
    //             setAddress(results[0].formatted_address);
    //         }
    //     });
    // }, []);

    // const handlePlaceChanged = useCallback(() => {
    //     const ac = autocompleteRef.current;
    //     if (!ac) return;
    //     const place = ac.getPlace();
    //     if (!place.geometry) return;
    //     const lat = place.geometry.location.lat();
    //     const lng = place.geometry.location.lng();
    //     setMarker({ lat, lng });
    //     setCenter({ lat, lng });
    //     setAddress(place.formatted_address || '');
    // }, []);

    const handleAccept = () => {
        onSelect('Retiro en CAVA CORP', null);
        onClose();
    };

    return (
        <>
            <style>{mapStyles}</style>
            <div className="mapa-overlay" onClick={onClose}>
                <div className="mapa-modal" onClick={e => e.stopPropagation()}>
                    <div className="mapa-header">
                        <h2>📍 Ubicación de nuestros almacenes</h2>
                        <button className="mapa-close-btn" onClick={onClose}>✕</button>
                    </div>

                    <div className="mapa-body">
                        <div className="mapa-container">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d568.8202055531095!2d-78.5384308610558!3d-0.28916521175994486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d599ed7b9ee87b%3A0xa46e64b94018ff10!2sCAVA%20CORP!5e1!3m2!1ses-419!2sec!4v1779147118384!5m2!1ses-419!2sec"
                                width="100%"
                                height="100%"
                                style={{ border: 0, display: 'block' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación CAVA CORP"
                            />
                        </div>

                        <div className="mapa-selected-addr">
                            📍 CAVA CORP — dirección de retiro
                        </div>
                    </div>

                    {/* -- Google Maps API (deshabilitado temporalmente) --
                    <div className="mapa-body">
                        <Autocomplete
                            onLoad={ref => { autocompleteRef.current = ref; }}
                            onPlaceChanged={handlePlaceChanged}
                        >
                            <div className="mapa-search-wrap">
                                <input type="text" placeholder="🔍 Busca tu dirección..." className="mapa-search-input" />
                            </div>
                        </Autocomplete>
                        <p className="mapa-hint">También puedes hacer clic directamente en el mapa para fijar tu ubicación.</p>
                        <div className="mapa-container">
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={center}
                                zoom={13}
                                onClick={handleMapClick}
                                options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                            >
                                {marker && <Marker position={marker} />}
                            </GoogleMap>
                        </div>
                        {address ? (
                            <div className="mapa-selected-addr">✅ {address}</div>
                        ) : (
                            <div className="mapa-no-addr">Haz clic en el mapa o busca tu dirección para seleccionarla</div>
                        )}
                    </div>
                    -- fin Google Maps API -- */}

                    <div className="mapa-footer">
                        <button className="mapa-btn-cancel" onClick={onClose}>Cancelar</button>
                        <button className="mapa-btn-accept" onClick={handleAccept}>
                            ✓ Confirmar ubicación
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
        </>
    );
};

export default MapaPicker;
