import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

export default function SignupScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
    return (
      <View className="bg-white h-full w-full">
        <StatusBar style="light" />
        <Image className="h-full w-full absolute" source={require("../assets/background_SignUp.png")} />
  
        {/* Titulo y Formulario */}
        <View className="h-full w-full flex justify-around pt-48">
          {/* Titulo */}
          <View className="flex items-center">
            <Text className="text-white font-bold tracking-wider text-5xl">Registrarse</Text>
          </View>
  
          {/* Formulario */}
          <View className="flex flex-col items-center mx-4 gap-y-6">
            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <TextInput placeholder="Nombre" placeholderTextColor="gray" />
            </View>
            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <TextInput placeholder="Apellido" placeholderTextColor="gray" />
            </View>
            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <TextInput placeholder="Correo" placeholderTextColor="gray" />
            </View>
            <View className="bg-black/5 p-5 rounded-2xl w-full mb-3">
              <TextInput placeholder="Contraseña" placeholderTextColor="gray" secureTextEntry />
            </View>
            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <TextInput placeholder="Telefono" placeholderTextColor="gray" />
            </View>
            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <TextInput placeholder="Direccion" placeholderTextColor="gray" />
            </View>
            <View className="w-full">
              <TouchableOpacity className="w-full bg-orange-500 p-3 rounded-2xl mb-3">
                <Text className="text-xl font-bold text-white text-center">Ingresar</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-center">
              <Text className="flex-row justify-center">¿Tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-orange-500">Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
  