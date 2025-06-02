import { useState } from "react";


export const Form = () => {

    const [stateAvatar, setStateAvatar] = useState({
        generatedImage: "https://cdn-icons-png.flaticon.com/512/2138/2138440.png",
        prompt: "",
        loading: false
    })

    const [selectedOption , setSelectedOption ] = useState("ia")


    

    return (
        <form>
            

            {/* Información del propietario */}
            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                    Información del propietario
                </legend>

                {/* Cédula */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Cédula</label>
                    <div className="flex items-center gap-10 mb-5">
                        <input
                            type="number"
                            placeholder="Ingresa la cédula"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        />
                        <button className="py-1 px-8 bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white sm:w-80"
                        
                        >
                            Consultar
                        </button>
                    </div>
                </div>

                {/* Nombre completo */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Nombres completos</label>
                    <input
                        type="text"
                        placeholder="Ingresa nombre y apellido"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                    />
                </div>

                {/* Correo electrónico */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Ingresa el correo electrónico"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                    />
                </div>

                {/* Celular */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Celular</label>
                    <input
                        type="number"
                        placeholder="Ingresa el celular"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                    />
                </div>
            </fieldset>

            {/* Información de la mascota */}
            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg mt-10">
                <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                    Información de la mascota
                </legend>

                {/* Nombre de la mascota */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Nombre</label>
                    <input
                        type="text"
                        placeholder="Ingresar nombre"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                    />
                </div>

                {/* Imagen de la mascota*/}
                <label className="mb-2 block text-sm font-semibold">Imagen de la mascota</label>
                <div className="flex gap-4 mb-2">
                    {/* Opción: Imagen con IA */}
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            value="ia"
                        />
                        Generar con IA
                    </label>

                    {/* Opción: Subir Imagen */}
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            value="upload"
                        />
                        Subir Imagen
                    </label>
                </div>

                {/* Imagen con IA */}
                {selectedOption === "ia" && (
                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-semibold">Imagen con IA</label>
                        <div className="flex items-center gap-10 mb-5">
                            <input
                                type="text"
                                placeholder="Ingresa el prompt"
                                className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                                value={stateAvatar.prompt}
                                onChange={(e) => setStateAvatar(prev => ({ ...prev, prompt: e.target.value }))}
                            />
                            <button
                                type="button"
                                className="py-1 px-8 bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white sm:w-80"
                                disabled={stateAvatar.loading}
                            >
                                {stateAvatar.loading ? "Generando..." : "Generar con IA"}
                            </button>
                        </div>
                        {stateAvatar.generatedImage && (
                            <img src={stateAvatar.generatedImage} alt="Avatar IA" width={100} height={100} />
                        )}
                    </div>
                )}

                {/* Subir Imagen */}
                {selectedOption === "upload" && (
                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-semibold">Subir Imagen</label>
                        <input
                            type="file"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        />
                    </div>
                )}

                {/* Tipo de mascota */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Tipo</label>
                    <select
                        id='prioridad'
                        className='block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5'
                    >
                        <option value="">--- Seleccionar ---</option>
                        <option value="gato">Gato</option>
                        <option value="perro">Perro</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>

                {/* Fecha de nacimiento */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Fecha de nacimiento</label>
                    <input
                        type="date"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                    />
                </div>

                {/* Síntomas */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Síntoma u observación</label>
                    <textarea
                        placeholder="Ingresa el síntoma u observación de forma general"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                    />
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