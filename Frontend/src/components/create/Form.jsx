import { useState } from "react"
import useFetch from "../../hooks/useFetch"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import {generateAvatar,convertBlobToBase64} from "../../helpers/consultarIA"
import { toast, ToastContainer } from "react-toastify"


export const Form = () => {

    const [avatar, setAvatar] = useState({
        image: "https://cdn-icons-png.flaticon.com/512/2138/2138440.png",
        prompt: "",
        loading: false
    })

    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm()
    const { fetchDataBackend } = useFetch()


    const selectedOption = watch("imageOption")


    const handleGenerateImage = async () => {
        setAvatar(prev => ({ ...prev, loading: true }))
        const blob = await generateAvatar(avatar.prompt)
        if (blob.type === "image/jpeg") {
            // blob:http://localhost/ea27cc7d-
            const imageUrl = URL.createObjectURL(blob)
            // data:image/png;base64,iVBORw0KGg
            const base64Image = await convertBlobToBase64(blob)           
            setAvatar(prev => ({ ...prev, image: imageUrl, loading: false }))
            setValue("avatarMascotaIA", base64Image)
        }
        else {
            toast.error("Error al generar la imagen, vuelve a intentarlo dentro de 1 minuto");
            setAvatar(prev => ({ ...prev, image: "https://cdn-icons-png.flaticon.com/512/2138/2138440.png", loading: false }))
            setValue("avatarMascotaIA", avatar.image)
        }
    }



    const registerPatient = async (data) => {
        /*
        const data = {
            nombre: "Firulais",
            edad: "2",
            imagen: [File]  // un array con 1 imagen cargada por el usuario
        }
        */
        // clase de JavaScript ideal para enviar datos como texto + imágenes al servidor
        const formData = new FormData()
        // Recorre todos los elementos del formulario
        Object.keys(data).forEach((key) => {
            if (key === "imagen") {
                formData.append("imagen", data.imagen[0]) // se guarda el archivo real
            } else {
                formData.append(key, data[key]) // se guardan nombre y edad
            }
        })
        const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        const headers= {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${storedUser.state.token}`
            }
        
        const response = await fetchDataBackend(url, formData, "POST", headers)
        if (response) {
            setTimeout(() => {
                navigate("/dashboard/listar")
            }, 2000);
        }
    }
    return (
        <form onSubmit={handleSubmit(registerPatient)}>
            <ToastContainer />

            {/* Información del propietario */}
            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                    Información del vendedor
                </legend>

                
                {/* Nombre completo */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Nombres completos</label>
                    <input
                        type="text"
                        placeholder="Ingresa nombre y apellido"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("nombrePropietario", { required: "El nombre completo es obligatorio" })}
                    />
                    {errors.nombrePropietario && <p className="text-red-800">{errors.nombrePropietario.message}</p>}
                </div>

                {/* Correo electrónico */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Ingresa el correo electrónico"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("emailPropietario", { required: "El correo electrónico es obligatorio" })}
                    />
                    {errors.emailPropietario && <p className="text-red-800">{errors.emailPropietario.message}</p>}
                </div>

                {/* Celular */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Celular</label>
                    <input
                        type="number"
                        placeholder="Ingresa el celular"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("celularPropietario", { required: "El celular es obligatorio" })}
                    />
                    {errors.celularPropietario && <p className="text-red-800">{errors.celularPropietario.message}</p>}
                </div>
            </fieldset>

            

            {/* Botón de submit */}
            <input
                type="submit"
                className="bg-gray-800 w-full p-2 mt-5 text-slate-300 uppercase font-bold rounded-lg 
                hover:bg-gray-600 cursor-pointer transition-all"
                value="Registrar"
            />
        </form>

    )
}