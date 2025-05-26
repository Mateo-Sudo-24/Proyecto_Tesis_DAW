

const ModalTreatments = () => {

    return (
        <div className="fixed inset-0 flex items-center justify-center">

            <div className="bg-gray-800 rounded-lg shadow-lg overflow-y-auto  max-w-lg w-full border border-gray-700 relative">

                <p className="text-white font-bold text-lg text-center mt-4">Tratamiento</p>

                <form className="p-10">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-50">Nombre</label>
                        <input
                            type="text"
                            placeholder="Ingresa el nombre"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5 bg-gray-50"
                            
                        />
                            
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-50">Descripción</label>
                        <textarea
                            type="text"
                            placeholder="Ingresa la descripción"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5 bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-50">Prioridad</label>
                        <select
                            id="prioridad"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5 bg-gray-50"
                        >
                            <option value="">--- Seleccionar ---</option>
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-50">Precio</label>
                        <input
                            type="number"
                            step="any" 
                            placeholder="Ingresa el precio"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5 bg-gray-50"

                        />
                    </div> 

                    <div className="flex justify-center gap-5">
                        <input
                            type="submit"
                            className="bg-green-700 px-6 text-slate-300 rounded-lg hover:bg-green-900 cursor-pointer"
                            value="Registrar"
                        />
                        <button className="sm:w-auto leading-3 text-center text-white px-6 py-4 rounded-lg bg-red-700 hover:bg-red-900"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalTreatments;
