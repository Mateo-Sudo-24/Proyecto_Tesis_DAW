import { useState } from "react"



const Chat = () => {

    const [chat, setChat] = useState(true)


    return (
        <>
            {
                chat
                    ? (
                        <div>
                            <form className="flex justify-center gap-5">
                                <input
                                    type="text"
                                    placeholder="Ingresa tu nombre de usuario"
                                    className="block w-1/2 rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-2 text-gray-500"
                                />
                                <button className="py-2 w-1/2 block text-center bg-gray-500 text-slate-300 border rounded-xl hover:scale-100 duration-300 hover:bg-gray-900 hover:text-white">Ingresar al chat</button>
                            </form>
                        </div>
                    )
                    : (
                        <div className="flex flex-col justify-center h-full ">
                            <div className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">


                            </div>

                            <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
                                <form>
                                    <div className="relative flex">
                                        <input type="text" placeholder="Escribe tu mensaje!" className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-2 bg-gray-200 rounded-md py-3"
                                        />

                                        <button className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-green-800 hover:bg-green-600 focus:outline-none"

                                        >
                                            <span className="font-bold">Enviar</span>
                                        </button>

                                    </div>
                                </form>
                            </div>
                        </div>

                    )
            }
        </>
    )
}

export default Chat