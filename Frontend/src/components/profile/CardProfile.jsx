
export const CardProfile = () => {

    return (
        <div className="bg-white border border-slate-200 h-auto p-4 
                        flex flex-col items-center justify-between shadow-xl rounded-lg">

            <div className="relative">
                <img src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" alt="img-client" className="m-auto rounded-full border-2 border-gray-300" width={120} height={120} />
                <label className="absolute bottom-0 right-0 bg-blue-400  text-white rounded-full p-2 cursor-pointer hover:bg-emerald-400">📷
                    <input type="file" accept="image/*" className="hidden" />
                </label>
            </div>

            <div className="self-start">
                <b>Nombre:</b><p className="inline-block ml-3"></p>
            </div>
            <div className="self-start">
                <b>Apellido:</b><p className="inline-block ml-3"></p>
            </div >
            <div className="self-start">
                <b>Dirección:</b><p className="inline-block ml-3"></p>
            </div>
            <div className="self-start">
                <b>Teléfono:</b><p className="inline-block ml-3"></p>
            </div>
            <div className="self-start">
                <b>Correo:</b><p className="inline-block ml-3"></p>
            </div>
        </div>
    )
}