import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import "./global.css"

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen"
import { RootStackParamList } from './navigation/types';

import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator<RootStackParamList>();



export default function App() {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login' screenOptions={{headerShown:false}}>
        <Stack.Screen name='Login' component={LoginScreen}/>
        <Stack.Screen name='Signup' component={SignupScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
    <Toast />
    </>
  );
}
