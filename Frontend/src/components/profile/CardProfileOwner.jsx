import storeProfile from "../../context/storeProfile"

export const CardProfileOwner = () => {
    const { user } = storeProfile()

    // Detecta si es cliente (propietario) o vendedor por el rol o por los campos presentes
    const isCliente = user?.rol === "cliente" || user?.nombrePropietario
    const isVendedor = user?.rol === "vendedor" || (user?.nombre && user?.apellido)

    return (
        <div className="bg-white border border-slate-200 h-auto p-4 
                        flex flex-col items-center justify-between shadow-xl rounded-lg">

            <div>
                <img src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" alt="img-profile" className="m-auto " width={120} height={120} />
            </div>

            

            {isVendedor && (
                <>
                    <div className="self-start">
                        <b>Nombre:</b>
                        <p className="inline-block ml-3">{user?.nombre}</p>
                    </div>
                    <div className="self-start">
                        <b>Apellido:</b>
                        <p className="inline-block ml-3">{user?.apellido}</p>
                    </div>
                    <div className="self-start">
                        <b>Dirección:</b>
                        <p className="inline-block ml-3">{user?.direccion}</p>
                    </div>
                    <div className="self-start">
                        <b>Teléfono:</b>
                        <p className="inline-block ml-3">{user?.telefono}</p>
                    </div>
                    <div className="self-start">
                        <b>Correo:</b>
                        <p className="inline-block ml-3">{user?.email}</p>
                    </div>
                </>
            )}
        </div>
    )
}