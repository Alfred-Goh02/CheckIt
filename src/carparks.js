
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { Pressable, View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import CPFavourites from './cpFavs';
import { useFocusEffect } from '@react-navigation/native';

export default function Carpark() {

  // State variables
  const [carParks, setCarParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [location, setLocation] = useState(null);
  const carParksPerPage = 10;

  // Fetch data on component mount and set interval for auto-refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Fetch data every 60 secs

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);


  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Fetch data from carpark API
   const fetchData = async () => {
    try {
      let allCarParks = [];
      let skipValue = 0;
      const batchSize = 500;
      let toContinue = true;
  
      // Fetch all carparks
      while (toContinue) {
        const response = await axios.get(`${process.env.REACT_APP_CARPARK_API_URL}?$skip=${skipValue}`, {
          headers: {
            'AccountKey': process.env.REACT_APP_ACC_KEY,
            'Accept': 'application/json',
          },
        });
  
        const carparkData = response.data.value;
  
        if (carparkData.length > 0) {
          allCarParks = allCarParks.concat(carparkData);
          skipValue += batchSize;
        } else {
          toContinue = false;
        }
      }
  
      const dropdowns = await AsyncStorage.getItem('CPdropdowns');
      const dropdownStates = dropdowns ? JSON.parse(dropdowns) : {};
  
      // Fetch favorites from Firestore
      const user = auth.currentUser;
      let favouriteCarParks = {};
      if (user) {
        const userId = user.uid;
        const favouriteRef = doc(db, 'users', userId, 'favorites', 'carParks');
        const docSnapshot = await getDoc(favouriteRef);
        if (docSnapshot.exists()) {
          favouriteCarParks = docSnapshot.data().favorites || {};
        }
      }
  
      // Define vehicle type order
      const vehicleTypeMapping = {
        C: 'Cars',
        H: 'Heavy Vehicles',
        Y: 'Motorcycles',
      };
  
      const vehicleTypeOrder = Object.keys(vehicleTypeMapping);
  
      // Consolidate carparks by name
      const carparkMap = {};
  
      allCarParks.forEach(carpark => {
        const name = carpark.Development;
  
        if (!carparkMap[name]) {
          carparkMap[name] = {
            carparkName: name,
            area: carpark.Area || 'Others',
            carparkID: carpark.CarParkID,
            location: carpark.Location,
            agency: carpark.Agency,
            vehicleTypes: [],
            isFavourite: !!favouriteCarParks[name],
            isOpen: !!dropdownStates[name],
          };
        }
  
        carparkMap[name].vehicleTypes.push({
          lotType: carpark.LotType,
          spacesAvailable: carpark.AvailableLots,
        });
      });
  
      // Sort vehicleTypes for each carpark entry
      const formattedCarParks = Object.values(carparkMap).map(carpark => ({
        ...carpark,
        vehicleTypes: carpark.vehicleTypes.sort((a, b) => 
          vehicleTypeOrder.indexOf(a.lotType) - vehicleTypeOrder.indexOf(b.lotType)
        ),
      }));
  
      setCarParks(formattedCarParks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };
  

  // Get user's current location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);

    filterNearbyCarparks(location); // Filter nearby carparks when location is obtained
  };

  // Filter carparks based on the user's location
  const filterNearbyCarparks = (location) => {
    if (!location) {
      console.log('No location data available');
      return;
    }

    const { latitude, longitude } = location.coords;
    const filteredCarParks = carParks.filter(carpark => {
      const [carparkLat, carparkLon] = carpark.location.split(' ').map(Number);
      const distance = getDistance(latitude, longitude, carparkLat, carparkLon);
      return distance <= 5; // Filter carparks within 5km radius
    });

    setCarParks(filteredCarParks);
  };

  // Calculate distance in km
  const getDistance = (lat1, lon1, lat2, lon2) => {
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
  };

  // Save dropdown states to AsyncStorage
  const saveDropdowns = async (updatedCarParks) => {
    const dropdowns = updatedCarParks.reduce((acc, carPark) => {
      if (carPark.isOpen) {
        acc[carPark.carparkName] = true;
      }
      return acc;
    }, {});

    await AsyncStorage.setItem('CPdropdowns', JSON.stringify(dropdowns));
  };

  // Toggle favorite state of a car park
  const toggleFavourite = async (carparkName) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    const userId = user.uid;
    const favouriteRef = doc(db, 'users', userId, 'favorites', 'carParks');
    const docSnapshot = await getDoc(favouriteRef);

    let currentFavourites = {};
    if (docSnapshot.exists()) {
      currentFavourites = docSnapshot.data().favorites || {};
    }

    if (currentFavourites[carparkName]) {
      delete currentFavourites[carparkName];
    } else {
      currentFavourites[carparkName] = true;
    }

    // Save the updated favorites to Firestore
    await setDoc(favouriteRef, { favorites: currentFavourites });

    // Update local state
    setCarParks(prevCarParks => {
      return prevCarParks.map(carpark => {
        if (carpark.carparkName === carparkName) {
          return { ...carpark, isFavourite: !carpark.isFavourite };
        }
        return carpark;
      });
    });
  };

  // Toggle dropdown state of a car park
  const toggleDropdown = (carparkName) => {
    setCarParks(prevCarParks => {
      const updatedCarParks = prevCarParks.map(carpark => {
        if (carpark.carparkName === carparkName) {
          return { ...carpark, isOpen: !carpark.isOpen };
        }
        return carpark;
      });

      saveDropdowns(updatedCarParks);
      return updatedCarParks;
    });
  };

  // Handle search query change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    closeAllDropdowns();
  };

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setCarParks(prevCarParks => {
      const updatedCarParks = prevCarParks.map(carPark => ({ ...carPark, isOpen: false }));
      saveDropdowns(updatedCarParks); 
      return updatedCarParks;
    });
  };

  // Filter car parks based on the search query
  const filteredCarParks = carParks.filter(carPark =>
    carPark.carparkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    carPark.carparkID.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate the filtered car parks
  const displayedCarParks = filteredCarParks.slice(0, currentPage * carParksPerPage);

  // Load more car parks when pressed
  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.container}>
        <Header closeAllDropdowns={closeAllDropdowns} />
        <View style={styles.locationBox}>
          <SearchBar 
            value={searchQuery} 
            onChangeText={handleSearchChange}
            testID="search-bar" 
          />
          <Pressable 
            style={styles.loadNearbyButton} 
            onPress={getLocation}
            testID="load-nearby-button"
          >
            <Ionicons name="location-sharp" size={34} color="white" />
          </Pressable>
        </View>
        <CarParkList
          carParks={displayedCarParks}
          toggleFavourite={toggleFavourite}
          toggleDropdown={toggleDropdown}
          fetchData={fetchData}
          testID="carpark-list"
        />
        {filteredCarParks.length > displayedCarParks.length && (
          <Button 
            title="Load More" 
            onPress={handleLoadMore}
            testID="load-more-button"
          />
        )}
      </LinearGradient>
    </ScrollView>
  );
}

// Header component
const Header = ({ closeAllDropdowns }) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    closeAllDropdowns();
    navigation.goBack();
  };

  const handleFavoritesPress = () => {
    closeAllDropdowns();
    navigation.navigate('CPFavourites');
  };

  return (
    <View style={styles.header}>
      <Pressable 
        style={styles.backButton} 
        onPress={handleBackPress}
        testID="back-button"
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </Pressable>
      <Text style={styles.headerText} testID="header-text">Car Parks</Text>
      <Ionicons name="chevron-forward" size={28} color="white" />
      <Pressable 
        style={styles.favoritesButton} 
        onPress={handleFavoritesPress}
        testID="favorites-button"
      >
        <Ionicons name="heart" size={30} color="white" />
      </Pressable>
    </View>
  );
};

// List component to display car parks
export const CarParkList = ({ carParks, toggleFavourite, toggleDropdown, fetchData }) => {
  // mapping lotTypes
  const lotTypeMapping = {
    C: 'Cars',
    H: 'Heavy Vehicles',
    Y: 'Motorcycles',
  };

  if (carParks.length === 0) {
    return (
      <View style={styles.noResults}>
        <Text style={styles.noResultsText}>No Carparks found</Text>
      </View>
    );
  }

  return (
    <View testID="carpark-list">
      {carParks.map((carPark, index) => (
        <View key={index} style={styles.carParkWrapper}>
          <View style={styles.carParkContainer}>
            <Pressable 
              style={styles.iconButton} 
              onPress={() => toggleFavourite(carPark.carparkName)}
              testID={`favourite-icon-${carPark.carparkName}`}
            >
              <HeartIcon filled={carPark.isFavourite} />
            </Pressable>
            <Pressable 
              style={styles.carParkDetails} 
              onPress={() => toggleDropdown(carPark.carparkName)}
              testID={`carpark-details-${carPark.carparkName}`}
            >
              <Text style={styles.carParkNumber}>Carpark: {carPark.carparkName}</Text>
              <Text style={styles.shortName}>Area: {carPark.area}</Text>
            </Pressable>
            <Pressable 
              style={styles.iconButton} 
              onPress={fetchData}
              testID="refresh-button"
            >
              <FontAwesome5 name="sync-alt" size={24} color="black" />
            </Pressable>
          </View>
          {carPark.isOpen && (
            <View style={styles.dropdownContent}>
              <Text style={styles.carParkAvail}>Available Lots</Text>
              {carPark.vehicleTypes.map((vehicle, i) => (
                <View key={i} style={styles.vehicleTypeContainer}>
                  <Text style={styles.carParkType}>{lotTypeMapping[vehicle.lotType]}: {vehicle.spacesAvailable}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// Heart icon component for favourites
const HeartIcon = ({ filled }) => {
  return (
    <Svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={filled ? "red" : "none"}
      stroke="red"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42
            4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C 13.09 3.81 14.76 3 16.5 
            3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </Svg>
  );
};

// Search bar component
 const SearchBar = ({ value, onChangeText }) => {
  return (
    <TextInput
      style={styles.searchBar}
      value={value}
      onChangeText={onChangeText}
      placeholder="Enter carpark name or code..."
      testID="search-bar-input"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: '#4682B4',
    padding: 10,
    marginBottom: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#FFFFF0',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1, 
    textAlign: 'center', 
  },
  carParkWrapper: {
    marginBottom: 16,
  },
  carParkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFF0',
    padding: 8,
    borderRadius: 10,
  },
  carParkDetails: {
    flex: 1,
    marginLeft: 8,
  },
  carParkNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  carParkAvail: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  carParkType: {
    fontSize: 18,
    color: 'black',
  },
  shortName: {
    fontSize: 15,
    color: "#606060",
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 5,
    paddingVertical: 1,
    paddingHorizontal: 2,
    width: 'fit-content',
    alignSelf: 'flex-start',
  },
  searchBar: {
    backgroundColor: '#FFFFF0',
    padding: 10,
    borderRadius: 30,
    fontSize: 16,
    flex: 1,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  noResultsText: {
    fontSize: 20,
    color: 'white',
  },
  backButton: {
    top: 5,
    left: 5,
    zIndex: 10,
    marginBottom: 10,
  },
  iconButton: {
    padding: 8,
  },
  dropdownContent: {
    backgroundColor: '#FFFFF0',
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
  },
  loadNearbyButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: '#4682B4',
    marginLeft: 8, 
    flexShrink: 0,
  },
});
