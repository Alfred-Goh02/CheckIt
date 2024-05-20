import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import TabLayout from './home';
import LoginScreen from './login';

const Stacks = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stacks.Navigator initialRouteName='Login'>
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
      </Stacks.Navigator>
    </NavigationContainer>
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
