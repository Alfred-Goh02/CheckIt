import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/Authprovider';
import React from 'react';
import TabLayout from './src/home';
import LoginScreen from './src/login';
import Signup from './src/signup';
import BusTime from './src/bustime';
import Carpark from './src/carparks';
import Taxi from './src/taxis';
import CPFavourites from './src/cpFavs';
import Forgotpw from './src/forgetpw';
import BusFavourites from './src/busFavs';

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
        options={{ headerShown: false }}
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
        options={{ headerShown: true, headerStyle: { backgroundColor: "#B0E0E6" }}}
      />
      <Stacks.Screen 
        name='CPFavourites'
        component={CPFavourites}
        options={{headerStyle:{backgroundColor:"#B0E0E6"}}}
      />
      <Stacks.Screen
        name='Forgot Password'
        component={Forgotpw}
        options={{headerStyle:{backgroundColor:"#B0E0E6"}}}
      />
      <Stacks.Screen
        name= 'BusFavourites'
        component={BusFavourites}
        options={{headerStyle:{backgroundColor:"#B0E0E6"}}}
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
