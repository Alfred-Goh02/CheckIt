import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
// React native imports
import { Link } from 'expo-router';
import { Pressable, View, Text, StyleSheet, ScrollView, TextInput, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import MapView, { Callout, MapOverlay } from 'react-native-maps';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Marker,Geojson } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}


export default function Taxi({ navigation }) {
    const [location, setlocation]=useState(null);
    useEffect(()=>{
      (async()=>{
        let {status}= await Location.requestForegroundPermissionsAsync();
        if (status!='granted'){
          console.log("Permission Denied");
          return;  
        }
        let location=await Location.getCurrentPositionAsync();
        setlocation({
          latitude:location.coords.latitude,
          longitude:location.coords.longitude
        });
      })();
    },[]);


    const [taxilocation, Settaxilocation]=useState([]);
    const [TaxiStop, SetTaxiStop]= useState([]);

    useEffect(() => {
      const fetchTaxiData = async () => {
        try {
          let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability',
            headers: {
              'AccountKey': 'X0n+k8P5S5u2bnIoUx6pKw==',
              'accept': 'application/json'
            }
          };
          const response = await axios.request(config);
          Settaxilocation(response.data.value);
        } catch (error) {
          console.log('Taxi Availability not fetching' );
        }
      };

      const fetchTaxiStands = async () => {
        try {
          let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://datamall2.mytransport.sg/ltaodataservice/TaxiStands',
            headers: {
              'AccountKey': 'wQRr38EdTU+b5QZjVHu+Rw==',
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

    if (!location) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    return (
    <View style={{flex:1}}>
        <MapView style={styles.map} initialRegion={{
           latitude: location.latitude,
           longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,}} 
          showsUserLocation={true}
          followsUserLocation={true}
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
          >
            <MaterialCommunityIcons name="bus-stop-covered" size={15} color="black" />
          </Marker>
        ))}


          {location && (
          <Marker
            coordinate={location}
            title="You are here"
            pinColor="blue" // You can customize the color or use a custom image
          />

        )}  
        </MapView>
    </View>
    );
  };
   




const styles=StyleSheet.create({
    container:{
        flex:1
    },
    map:{
        flex:1,
        width:'100%',
        height:'100%'
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