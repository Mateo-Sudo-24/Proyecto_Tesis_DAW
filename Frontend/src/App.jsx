import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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
import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import useProfileStore from './context/storeProfile';
import useAuthStore from './context/storeAuth';

function AppContent() {
  const { profile, user } = useProfileStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      profile();
    }
  }, [token, profile]);

  // Admin and sellers land on /ventas, everyone else on /perfil
  const DashboardIndex = () => {
    if (user?.rol === 'administrador' || user?.rol === 'vendedor') return <Navigate to="/dashboard/ventas" replace />;
    return <Navigate to="/dashboard/perfil" replace />;
  };

  const RootRedirect = () => {
    if (!token) return <Navigate to="/home" />;
    return <Navigate to="/dashboard" />;
  };

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

          {/* Rutas solo para no autenticados */}
          <Route element={<PublicRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot" element={<Forgot />} />
            <Route path="forgot/:id" element={<Forgot />} />
            <Route path="confirm/:token" element={<Confirm />} />
            <Route path="confirmar/:token" element={<Confirm />} />
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
            <Route path="productos" element={<Productos />} />
            <Route path="productos-admin" element={<ProductosAdmin />} />
            <Route path="actualizar-producto/:id" element={<UpdateProducto />} />
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="mis-pedidos" element={<MisPedidos />} />
            <Route path="ventas" element={<Ventas />} />
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
