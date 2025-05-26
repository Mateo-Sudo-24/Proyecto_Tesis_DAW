
const CardPassword = () => {

    return (
        <>
            <div className='mt-5'>
                <h1 className='font-black text-2xl text-gray-500 mt-16'>Actualizar contraseña</h1>
                <hr className='my-4 border-t-2 border-gray-300' />
            </div>

            <form >

                <div>
                    <label className="mb-2 block text-sm font-semibold">Contraseña actual</label>
                    <input type="text" placeholder="Ingresa tu contraseña actual" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">Nueva contraseña</label>
                    <input type="text" placeholder="Ingresa la nueva contraseña" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
                </div>

                <input
                    type="submit"
                    className='bg-gray-800 w-full p-2 text-slate-300 uppercase font-bold rounded-lg 
                        hover:bg-gray-600 cursor-pointer transition-all'
                    value='Cambiar' />

            </form>
        </>
    )
}

export default CardPassword