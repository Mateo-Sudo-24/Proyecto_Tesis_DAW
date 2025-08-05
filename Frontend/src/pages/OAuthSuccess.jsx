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

  return <p>Procesando autenticación...</p>;
};

export default OAuthSuccess;
