
const FormularioPerfil = () => {


    return (
        <form >
            <div>
                <label className="mb-2 block text-sm font-semibold">Nombre</label>
                <input type="text" placeholder="Ingresa tu nombre" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold">Apellido</label>
                <input type="text" placeholder="Ingresa tu apellido" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold">Dirección</label>
                <input type="text" placeholder="Ingresa tu dirección" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold">Teléfono</label>
                <input type="number" placeholder="Ingresa tu teléfono" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                <input type="email" placeholder="Ingresa tu correo" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>

            <input
                type="submit"
                className='bg-gray-800 w-full p-2 mt-5 text-slate-300 uppercase font-bold rounded-lg 
                        hover:bg-gray-600 cursor-pointer transition-all'
                value='Actualizar' />

        </form>
    )
}

export default FormularioPerfil