import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Home } from './pages/Home';
import Nosotros from './pages/Nosotros';
import Contact from './pages/Contact';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
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
import Carrito from './components/carrito/Carrito';
import Productos from './components/Productos/Productos';
import ChatbotBubble from './components/chatbot/ChatbotBubble';
import ProductosAdmin from './pages/ProductosAdmin';
import UpdateProducto from './pages/UpdateProducto';
import Notificaciones from './pages/Notificaciones';
import MisPedidos from './pages/MisPedidos';
import Ventas from './pages/Ventas';
import Usuarios from './pages/Usuarios';
import OAuthSuccess from './pages/OAuthSuccess';
import TiendaVendedor from './pages/TiendaVendedor';
import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import useProfileStore from './context/storeProfile';
import useAuthStore from './context/storeAuth';

function AppContent() {
  const { profile, user, isLoading } = useProfileStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      profile();
    }
  }, [token, profile]);

  const DashboardIndex = () => {
    if (user?.rol === 'administrador' || user?.rol === 'vendedor') return <Navigate to="/dashboard/ventas" replace />;
    if (user?.rol === 'cliente') return <Navigate to="/dashboard/productos" replace />;
    return <Navigate to="/dashboard/perfil" replace />;
  };

  const AdminVendorOnly = ({ children }) => {
    if (user?.rol === 'cliente') return <Navigate to="/dashboard/productos" replace />;
    return children;
  };

  const ClienteOnly = ({ children }) => {
    if (user?.rol === 'administrador' || user?.rol === 'vendedor') return <Navigate to="/dashboard/ventas" replace />;
    return children;
  };

  const VendedorOnly = ({ children }) => {
    if (user?.rol !== 'vendedor') return <Navigate to="/dashboard" replace />;
    return children;
  };

  AdminVendorOnly.propTypes = { children: PropTypes.node };
  ClienteOnly.propTypes = { children: PropTypes.node };
  VendedorOnly.propTypes = { children: PropTypes.node };

  const RootRedirect = () => {
    if (!token) return <Navigate to="/home" />;
    return <Navigate to="/dashboard" />;
  };

  if (token && (isLoading || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div style={{ textAlign: 'center', color: '#374151' }}>
          <div
            style={{
              width: 46,
              height: 46,
              border: '4px solid #fde8ce',
              borderTopColor: '#e8760a',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
          <p style={{ fontWeight: 800, margin: 0 }}>Optimizando tu experiencia...</p>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.35rem' }}>Cargando tu panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full">
        <Routes>
          {/* Raíz: valida autenticación */}
          <Route index element={<RootRedirect />} />

          {/* Rutas públicas abiertas (accesibles con o sin sesión) */}
          <Route path="home" element={<Home />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="confirm/:token" element={<Confirm />} />
          <Route path="confirmar/:token" element={<Confirm />} />

          {/* Rutas solo para no autenticados */}
          <Route element={<PublicRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot" element={<Forgot />} />
            <Route path="forgot/:id" element={<Forgot />} />
            <Route path="/vendedores/setup-account/:token" element={<SetupAccount />} />
            <Route path="/clientes/setup-account/:token" element={<SetupAccount />} />
            <Route path="reset/:token" element={<Reset />} />
          </Route>

          {/* Rutas protegidas */}
          <Route
            path="dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardIndex />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="listar" element={<List />} />
            <Route path="visualizar/:id" element={<Details />} />
            <Route path="crear" element={<Create />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="actualizar/:id" element={<Update />} />
            <Route path="chat" element={<Chat />} />
            <Route path="carrito" element={<Carrito />} />
            <Route path="productos" element={<ClienteOnly><Productos /></ClienteOnly>} />
            <Route path="tienda" element={<VendedorOnly><TiendaVendedor /></VendedorOnly>} />
            <Route path="productos-admin" element={<AdminVendorOnly><ProductosAdmin /></AdminVendorOnly>} />
            <Route path="actualizar-producto/:id" element={<UpdateProducto />} />
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="mis-pedidos" element={<MisPedidos />} />
            <Route path="ventas" element={<AdminVendorOnly><Ventas /></AdminVendorOnly>} />
          </Route>

          {/* OAuth success */}
          <Route path="oauth-success" element={<OAuthSuccess />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <ChatbotBubble />
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover limit={3} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
