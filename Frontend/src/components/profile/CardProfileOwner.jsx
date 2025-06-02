export const CardProfileOwner = () => {

    return (
        <div className="bg-white border border-slate-200 h-auto p-4 
                        flex flex-col items-center justify-between shadow-xl rounded-lg">

            <div>
                <img src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" alt="img-client" className="m-auto " width={120} height={120} />
            </div>
            <div className="self-start">
                <b>Nombre:</b><p className="inline-block ml-3"></p>
            </div >
            <div className="self-start">
                <b>Cédula:</b><p className="inline-block ml-3"></p>
            </div >
            <div className="self-start">
                <b>Email:</b><p className="inline-block ml-3"></p>
            </div>
            <div className="self-start">
                <b>Celular:</b><p className="inline-block ml-3"></p>
            </div>
            <div className="self-start">
                <b>Nombre de la mascota:</b><p className="inline-block ml-3"></p>
            </div>
        </div>
    )
}