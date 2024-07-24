import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { db } from './lib/firebase';
import { getAuth } from 'firebase/auth';
import CPFavouritesTab from './cpFavsTab';

const Favourite = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'car', title: 'Carparks', icon: 'car-outline' },
    { key: 'bus', title: 'Buses', icon: 'bus-outline' },
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      renderIcon={({ route, focused, color }) => (
        <Ionicons
          name={route.icon}
          size={24}
          color={focused ? 'black' : 'gray'}
        />
      )}
      renderLabel={({ route, focused, color }) => (
        <Text style={{ color: focused ? 'black' : 'gray', margin: 8 }}>
          {route.title}
        </Text>
      )}
      indicatorStyle={styles.indicator}
      style={styles.tabbar}
    />
  );

  const renderScene = SceneMap({
    car: CPFavouritesTab,
    bus: BusScreen,
  });

  return (
    <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </LinearGradient>
  );
};

const CarScreen = () => (
  <View style={styles.scene}>
    <Text style={styles.text}>Car Content</Text>
  </View>
);

const BusScreen = () => (
  <View style={styles.scene}>
    <Text style={styles.text}>Bus Content</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
  tabbar: {
    backgroundColor: '#B0E0E6',
  },
  indicator: {
    backgroundColor: 'black',
  },
});

export default Favourite;
