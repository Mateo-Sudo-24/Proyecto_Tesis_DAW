import CardPassword from '../components/profile/CardPassword';
import { CardProfile } from '../components/profile/CardProfile';
import { CardProfileOwner } from '../components/profile/CardProfileOwner';
import FormProfile from '../components/profile/FormProfile';
import storeProfile from '../context/storeProfile';

const Profile = () => {
    const { user } = storeProfile();

    return (
        <div className="p-6">
            {/* Encabezado */}
            <div className="mb-6">
                <h1 className="font-black text-3xl text-amber-900">Perfil</h1>
                <hr className="border-amber-700 my-3" />
                <p className="text-amber-800">
                    Este módulo te permite gestionar el perfil del usuario
                </p>
            </div>

            {/* Contenido según rol */}
            {user && (user.rol === "cliente" || user.rol === "vendedor") ? (
                <div className="flex justify-center">
                    <CardProfileOwner />
                </div>
            ) : user && user.rol === "administrador" ? (
                <div className="flex flex-col md:flex-row md:justify-between gap-6">
                    {/* Formulario */}
                    <div className="w-full md:w-1/2 bg-amber-50 rounded-lg shadow p-5 border border-amber-200">
                        <FormProfile />
                    </div>

                    {/* Info y cambio de contraseña */}
                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                        <div className="bg-amber-50 rounded-lg shadow p-5 border border-amber-200">
                            <CardProfile />
                        </div>
                        <div className="bg-amber-50 rounded-lg shadow p-5 border border-amber-200">
                            <CardPassword />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-amber-600 mt-10">
                    No se pudo cargar el perfil del usuario.
                </div>
            )}
        </div>
    );
};

export default Profile;
