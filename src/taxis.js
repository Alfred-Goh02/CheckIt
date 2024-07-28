
// React native imports
import { Pressable, View, Text, StyleSheet, ScrollView, TextInput, Modal, Image } from 'react-native';
import React, { useState } from 'react';
import MapView, { Callout, MapOverlay, PROVIDER_GOOGLE } from 'react-native-maps';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Marker, Geojson } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const toRad = Math.PI / 180;
  lat1 *= toRad;
  lon1 *= toRad;
  lat2 *= toRad;
  lon2 *= toRad;
  const distance = Math.acos(
    Math.sin(lat1) * Math.sin(lat2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  ) * R;
  return distance;
}


export default function Taxi({ navigation }) {
  const [location, setlocation] = useState(null);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status != 'granted') {
        console.log("Permission Denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync();
      setlocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    })();
  }, []);


  const [taxilocation, Settaxilocation] = useState([]);
  const [TaxiStop, SetTaxiStop] = useState([]);

  useEffect(() => {
    const fetchTaxiData = async () => {
      try {
        let config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `${process.env.REACT_APP_TAXI_API_URL}`,
          headers: {
            'AccountKey': process.env.REACT_APP_ACC_KEY,
            'accept': 'application/json'
          }
        };
        const response = await axios.request(config);
        Settaxilocation(response.data.value);
      } catch (error) {
        console.log('Taxi Availability not fetching');
      }
    };

    const fetchTaxiStands = async () => {
      try {
        let config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `${process.env.REACT_APP_TAXISTAND_API_URL}`,
          headers: {
            'AccountKey': process.env.REACT_APP_TAXISTAND_ACC_KEY,
            'accept': 'application/json'
          }
        };
        const response = await axios.request(config);
        SetTaxiStop(response.data.value);
      } catch (error) {
        console.log('Taxi Stand not fetching');
      }
    };

    fetchTaxiStands();
    fetchTaxiData();
  }, []);

  // Inside Taxi component
  if (!location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" testID="loading-indicator" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
        provider={PROVIDER_GOOGLE}
        testID="map"
      >
        {taxilocation.length > 0 && location && taxilocation
          .filter(taxi => getDistanceFromLatLonInKm(location.latitude, location.longitude, taxi.Latitude, taxi.Longitude) <= 2)
          .map((taxi, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: taxi.Latitude,
                longitude: taxi.Longitude
              }}
              title="Taxi"
              pinColor="red"
              testID="taxi-marker"
            >
              <FontAwesome name="taxi" size={10} color="black" />
            </Marker>
          ))}

        {TaxiStop.map((stand, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: stand.Latitude,
              longitude: stand.Longitude
            }}
            title={stand.Name}
            description={`Ownership: ${stand.Ownership} Type: ${stand.Type}`}
            testID="stand-marker"
          >
            <MaterialCommunityIcons name="bus-stop-covered" size={15} color="black" />
          </Marker>
        ))}

        {location && (
          <Marker
            coordinate={location}
            title="You are here"
            pinColor="blue"
            testID="you-are-here-marker"
          />
        )}
      </MapView>
    </View>
  );

};





const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  callout: {
    width: 150,
    padding: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  }
});