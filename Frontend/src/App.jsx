import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { Home } from './pages/Home';
import Login from './pages/Login';
import { Register } from './pages/Register';
import { Forgot } from './pages/Forgot';
import { Confirm } from './pages/Confirm';
import SetupAccount from './pages/setupAccount';
import { NotFound } from './pages/NotFound';
import Dashboard from './layout/Dashboard';
import Profile from './pages/Profile';
import List from './pages/List';
import Details from './pages/Details';
import Create from './pages/Create';
import Update from './pages/Update';
import Chat from './pages/Chat';
import Reset from './pages/Reset';
import Nosotros from './pages/Nosotros';
import Products from './pages/Products';
import Contact from './pages/Contact';
import Carrito from './components/carrito/Carrito';
import Productos from './components/Productos/Productos';
import ChatbotBubble from './components/chatbot/ChatbotBubble';
import ProductosAdmin from './pages/ProductosAdmin';
import UpdateProducto from './pages/UpdateProducto';
import Notificaciones from './pages/Notificaciones';

import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import useProfileStore from './context/storeProfile';
import useAuthStore from './context/storeAuth';

function AppContent() {
  const { profile } = useProfileStore();
  const { token } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      profile();
    }
  }, [token, profile]);

  // ✅ MIDDLEWARE: Ruta raíz - Si hay token va a Dashboard, si no a Home
  const RootRedirect = () => {
    return token ? <Navigate to="/dashboard" /> : <Navigate to="/home" />;
  };

  return (
    <>
      <Routes>
        {/* ✅ RAÍZ: Validación de autenticación */}
        <Route index element={<RootRedirect />} />

        {/* ✅ RUTAS PÚBLICAS: Accesibles sin token */}
        <Route element={<PublicRoute />}>
          <Route path="home" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot/:id" element={<Forgot />} />
          <Route path="confirm/:token" element={<Confirm />} />
          <Route path="/vendedores/setup-account/:token" element={<SetupAccount />} />
          <Route path="reset/:token" element={<Reset />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="products" element={<Products />} />
          <Route path="contacto" element={<Contact />} />
        </Route>

        {/* ✅ RUTAS PROTEGIDAS: Solo con token */}
        <Route
          path="dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="listar" element={<List />} />
          <Route path="visualizar/:id" element={<Details />} />
          <Route path="crear" element={<Create />} />
          <Route path="actualizar/:id" element={<Update />} />
          <Route path="chat" element={<Chat />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="productos" element={<Productos />} />
          <Route path="productos-admin" element={<ProductosAdmin />} />
          <Route path="actualizar-producto/:id" element={<UpdateProducto />} />
          <Route path="notificaciones" element={<Notificaciones />} />
        </Route>

        {/* ✅ 404: Ruta no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Mostrar el chatbot bubble en todas las rutas */}
      <ChatbotBubble />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
