import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '@/src/app/(tabs)/_layout';
import BusTiming from '@/src/app/(tabs)/busTime';

const Stack = createNativeStackNavigator();

function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Bus Timing" component={BusTiming} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;