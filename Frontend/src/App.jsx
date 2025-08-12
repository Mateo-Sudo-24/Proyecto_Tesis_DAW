import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
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
import ChatbotBubble from './components/chatbot/ChatbotBubble'; // <-- tu componente de burbuja

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

  // rutas donde se mostrará el chatbot
  const rutasConChat = ['/', '/nosotros', '/products', '/contacto'];

  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot/:id" element={<Forgot />} />
          <Route path="confirm/:token" element={<Confirm />} />
          <Route path="/vendedores/setup-account/:token" element={<SetupAccount />} />
          <Route path="reset/:token" element={<Reset />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="products" element={<Products />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

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
        </Route>
      </Routes>

      {/* Mostrar el bubble solo en rutas específicas */}
      {rutasConChat.includes(location.pathname) && <ChatbotBubble />}
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
