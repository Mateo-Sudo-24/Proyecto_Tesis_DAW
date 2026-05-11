import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storeAuth from '../context/storeAuth';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const setToken = storeAuth((state) => state.setToken);
  const setRol = storeAuth((state) => state.setRol);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
     const tokenParam = params.get('token');
    console.log("Token recibido:", tokenParam);

      if (!tokenParam) return;

  console.log("Token recibido:", tokenParam);

  try {
    const payload = JSON.parse(atob(tokenParam.split('.')[1]));
    const rol = payload.rol;
    console.log("Rol:", rol);

    setToken(tokenParam);
    setRol(rol);

    navigate('/dashboard');
  } catch (error) {
    console.error("Error al procesar el token:", error);
    navigate('/login');
  }
}, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
        <h1 className="text-2xl font-extrabold mb-2">
          <span className="text-gray-700">IN</span><span className="text-gray-900">TEX</span>
        </h1>
        <div className="flex justify-center my-6">
          <div className="w-10 h-10 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-600 font-semibold">Procesando autenticación...</p>
        <p className="text-gray-400 text-sm mt-1">Serás redirigido en un momento.</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
