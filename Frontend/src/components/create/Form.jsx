import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import storeAuth from "../../context/storeAuth";
import storeProfile from "../../context/storeProfile";
import { FormProducto } from "./FormProducto";
import { FormCliente } from "./FormCliente";

/**
 * ✅ COMPONENTE FORM INTELIGENTE
 * Recibe tipoCreacion y renderiza el formulario correspondiente:
 * - "producto" → FormProducto (crear/editar productos con imagen Cloudinary)
 * - "usuario" → FormCliente (crear/editar usuarios)
 */
export const Form = ({ usuarioToUpdate, productoToUpdate, tipoCreacion }) => {
  // ✅ OBTENER ROL: Primero de storeProfile (actualizado), luego de storeAuth
  const authRol = storeAuth((state) => state.rol);
  const { user } = storeProfile();
  const rolActual = user?.rol || authRol; // Prioriza rol del perfil

  // ✅ MIDDLEWARE: Validar autenticación
  useEffect(() => {
    if (!rolActual) {
      console.warn("⚠️ Rol no disponible:", { authRol, userRol: user?.rol });
      toast.error("No estás autenticado. Por favor, inicia sesión.");
    }
  }, [rolActual, authRol, user?.rol]);

  // ✅ LÓGICA DE RENDERIZACIÓN SEGÚN TIPO DE CREACIÓN
  if (!rolActual) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md text-center">
        <p className="text-red-600 font-semibold">No autorizado - Rol no disponible</p>
        <p className="text-xs text-gray-500 mt-2">Por favor, cierra sesión y vuelve a iniciar</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      
      {/* ✅ TIPO PRODUCTO: Mostrar FormProducto */}
      {tipoCreacion === "producto" && (
        <FormProducto productoToUpdate={productoToUpdate} />
      )}

      {/* ✅ TIPO USUARIO: Mostrar FormCliente */}
      {tipoCreacion === "usuario" && (
        <FormCliente clienteToUpdate={usuarioToUpdate || user} />
      )}

      {/* ✅ SIN TIPO ESPECIFICADO: Mostrar según rol (compatibilidad hacia atrás) */}
      {!tipoCreacion && rolActual === "vendedor" && (
        <FormProducto productoToUpdate={productoToUpdate} />
      )}
      {!tipoCreacion && rolActual === "administrador" && (
        <FormProducto productoToUpdate={productoToUpdate} />
      )}
      {!tipoCreacion && rolActual === "cliente" && (
        <FormCliente clienteToUpdate={usuarioToUpdate || user} />
      )}
    </>
  );
};

export default Form;
