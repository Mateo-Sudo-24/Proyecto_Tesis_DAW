import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import useFetch from "../../hooks/useFetch";

// Mantenemos el nombre 'Form' como lo tenías para evitar errores de importación.
export const Form = () => {
    const navigate = useNavigate();
    // Se simplifica el hook useForm, ya que no necesitamos 'setValue' ni 'watch'
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend } = useFetch();

    // Función adaptada y corregida para registrar VENDEDORES
    const registerVendedor = async (data) => {
        // El objeto 'data' que recibimos del formulario ahora tendrá los nombres correctos:
        // { nombre: "...", apellido: "...", email: "..." }

        // 1. URL del endpoint correcto
        const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores`;

        // 2. Cabeceras y validación del token de autenticación
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        if (!storedUser?.state?.token) {
            toast.error("No estás autenticado. Por favor, inicia sesión de nuevo.");
            return;
        }
        const headers = {
            // CORREGIDO: El Content-Type debe ser 'application/json' porque no estamos enviando archivos.
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        };

        // 3. Manejo de errores con try...catch para una mayor robustez
        try {
            // CORREGIDO: Enviamos el objeto 'data' directamente como JSON. Ya no se usa FormData.
            const response = await fetchDataBackend(url, data, "POST", headers);

            // Si la petición es exitosa (useFetch no lanza error)
            if (response) {
                // El toast de éxito ya lo maneja tu hook useFetch.
                // Simplemente redirigimos al usuario después de un momento.
                setTimeout(() => {
                    navigate("/dashboard/listar");
                }, 2000);
            }
        } catch (error) {
            // El toast de error también lo maneja tu hook useFetch.
            // Aquí solo dejamos un log para depuración en caso de que algo falle.
            console.error("Error detallado al registrar el vendedor:", error);
        }
    };

    return (
        // El formulario ahora llama a la función correcta 'registerVendedor'
        <form onSubmit={handleSubmit(registerVendedor)}>
            <ToastContainer />

            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                    Información del Vendedor
                </legend>

                {/* --- SECCIÓN DE FORMULARIO CORREGIDA --- */}

                {/* 4. Campo de Nombres (corregido) */}
                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Nombres</label>
                    <input
                        type="text"
                        placeholder="Ingresa los nombres del vendedor"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("nombre", { required: "El nombre es obligatorio" })}
                    />
                    {errors.nombre && <p className="text-red-800">{errors.nombre.message}</p>}
                </div>

                {/* 5. Campo de Apellidos (nuevo y requerido por la API) */}
                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Apellidos</label>
                    <input
                        type="text"
                        placeholder="Ingresa los apellidos del vendedor"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("apellido", { required: "El apellido es obligatorio" })}
                    />
                    {errors.apellido && <p className="text-red-800">{errors.apellido.message}</p>}
                </div>

                {/* 6. Campo de Email (nombre corregido) */}
                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Ingresa el correo electrónico"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("email", { required: "El correo electrónico es obligatorio" })}
                    />
                    {errors.email && <p className="text-red-800">{errors.email.message}</p>}
                </div>

                {/* Se eliminó el campo de celular, ya que no es requerido por la API para la creación */}
            </fieldset>

            <input
                type="submit"
                className="bg-gray-800 w-full p-2 mt-5 text-slate-300 uppercase font-bold rounded-lg 
                hover:bg-gray-600 cursor-pointer transition-all"
                value="Registrar Vendedor"
            />
        </form>
    );
};