import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Toast from "react-native-toast-message";

type FormData = {
  nombre: string;
  apellido: string;
  celular: string;
  email: string;
  password: string;
  direccion: string;
};

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  const registro = async (data: FormData) => {
    try {
      const url = "http://192.168.1.45:3000/api/registro";
      const respuesta = await axios.post(url, data);

      Toast.show({
        type: "success",
        text1: "Éxito",
        text2: respuesta.data.msg,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || "Error desconocido";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMsg,
      });
    }
  };

  return (
    <View className="bg-white h-full w-full">
      <StatusBar style="light" />
      <Image className="h-full w-full absolute" source={require("../assets/background_SignUp.png")} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Image className="h-full w-full absolute" source={require("../assets/background_SignUp.png")} />
        <View className="h-full w-full flex justify-around pt-40 pb-10">
          {/* Título */}
          <View className="flex items-center mb-4">
            <Text className="text-white font-bold tracking-wider text-5xl">Registrarse</Text>
          </View>

          {/* Formulario */}
          <View className="flex flex-col items-center mx-4 gap-y-6">
            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <Controller
                control={control}
                name="nombre"
                rules={{ required: "El nombre es obligatorio" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Nombre"
                    placeholderTextColor="gray"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.nombre && <Text className="text-red-800">{errors.nombre.message}</Text>}
            </View>

            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <Controller
                control={control}
                name="apellido"
                rules={{ required: "El apellido es obligatorio" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Apellido"
                    placeholderTextColor="gray"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.apellido && <Text className="text-red-800">{errors.apellido.message}</Text>}
            </View>

            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <Controller
                control={control}
                name="celular"
                rules={{ required: "El celular es obligatorio" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Celular"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.celular && <Text className="text-red-800">{errors.celular.message}</Text>}
            </View>

            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <Controller
                control={control}
                name="email"
                rules={{ required: "El correo electrónico es obligatorio" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Correo"
                    placeholderTextColor="gray"
                    keyboardType="email-address"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text className="text-red-800">{errors.email.message}</Text>}
            </View>

            <View className="bg-black/5 p-5 rounded-2xl w-full">
              <Controller
                control={control}
                name="password"
                rules={{ required: "La contraseña es obligatoria" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Contraseña"
                    placeholderTextColor="gray"
                    secureTextEntry
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && <Text className="text-red-800">{errors.password.message}</Text>}
            </View>

            <View className="bg-black/5 p-5 rounded-2xl w-full mb-3">
              <Controller
                control={control}
                name="direccion"
                rules={{ required: "La dirección es obligatoria" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Dirección"
                    placeholderTextColor="gray"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.direccion && <Text className="text-red-800">{errors.direccion.message}</Text>}
            </View>

            {/* Botón */}
            <TouchableOpacity
              className="w-full bg-orange-500 p-3 rounded-2xl mb-3"
              onPress={handleSubmit(registro)}
            >
              <Text className="text-xl font-bold text-white text-center">Ingresar</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text>¿Tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-orange-500">Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
