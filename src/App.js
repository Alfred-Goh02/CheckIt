import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './Authprovider';
import React from 'react';
import TabLayout from './home';
import LoginScreen from './login';
import Signup from './signup';
import BusTime from './bustime';
import Carpark from './carparks';
import Taxi from './taxis';

const Stacks = createNativeStackNavigator();

function AuthNavigator() {
  const { user } = useAuth();

  return (
    <Stacks.Navigator initialRouteName={user ? 'Home' : 'Login'}>
      <Stacks.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stacks.Screen
        name="Home"
        component={TabLayout}
        options={{ headerShown: false }} 
      />
      <Stacks.Screen
        name="Signup"
        component={Signup}
        options={{ headerStyle: { backgroundColor: "#F838D5" } }}
      />
      <Stacks.Screen
        name="BusTime"
        component={BusTime}
        options={{ headerShown: false }}
      />
      <Stacks.Screen
        name="Carpark"
        component={Carpark}
        options={{ headerShown: false }}
      />
      <Stacks.Screen
        name="Taxi"
        component={Taxi}
        options={{ headerShown: false }}
      />
    </Stacks.Navigator>
  );
}

export default function App() {
  return (

   <AuthProvider>
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    </AuthProvider>
  
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
