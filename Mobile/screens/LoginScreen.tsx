import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";



export default function LoginScreen(){
    return(
        <View className="bg-white h-full w-full">
            <StatusBar style="light"/>
            <Image className="h-full w-full absolute" source={require("../assets/background.png")}/> 
            
            
            {/* Titulo y Formulario*/}
            <View className="h-full w-full flex justify-around pt-15 pb-10">
                {/* Titulo */}
                <View className="flex items-center">
                    <Text className="text-white font-bold tracking-wider text-5xl">Bienvenido</Text>
                </View>
                {/*Formulario */}
                <View className="flex items-center mx-4 space-y-4">
                    <View className="bg-black/5 p-5 rounded-2xl w-full">
                        <TextInput placeholder="Correo" placeholderTextColor="gray"></TextInput>
                    </View>
                    <View className="bg-black/5 p-5 rounded-2xl w-full mb-3">
                        <TextInput placeholder="Contraseña" placeholderTextColor="gray" secureTextEntry></TextInput>
                    </View>
                    <View className="w-full">
                        <TouchableOpacity className="w-full bg-orange-500 p-3 rounded-2xl mb-3">
                            <Text className="text-xl font-bold text-white text-center">Ingresar</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-center">
                        <Text className="flex-row justify-center">No tienes cuenta?</Text>
                        <TouchableOpacity >
                            <Text className="text-orange-500 ">Registrarse</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}
