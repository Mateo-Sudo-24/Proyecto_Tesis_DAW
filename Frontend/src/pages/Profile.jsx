import CardPassword from '../components/profile/CardPassword'
import { CardProfile } from '../components/profile/CardProfile'
import { CardProfileOwner } from '../components/profile/CardProfileOwner'
import FormProfile from '../components/profile/FormProfile'
import storeProfile from '../context/storeProfile'


const Profile = () => {
    const { user } = storeProfile()

    return (
        <>       
            <div>
                <h1 className='font-black text-4xl text-gray-500'>Perfil</h1>
                <hr className='x'/>
                <p className='mb-8'>Este módulo te permite gestionar el perfil del usuario</p>
            </div>
            {
                user && (user.rol === "cliente" || user.rol === "vendedor")
                    ? (
                        <div className='flex justify-center'>
                            <CardProfileOwner />
                        </div>
                    )
                    : user && user.rol === "administrador"
                        ? (
                            <div className='flex justify-around gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                                <div className='w-full md:w-1/2'>
                                    <FormProfile/>
                                </div>
                                <div className='w-full md:w-1/2'>
                                    <CardProfile/>
                                    <CardPassword/>
                                </div>
                            </div>
                        )
                        : (
                            <div className='text-center text-gray-400 mt-10'>
                                No se pudo cargar el perfil del usuario.
                            </div>
                        )
            }
        </>

    )
}

export default Profile