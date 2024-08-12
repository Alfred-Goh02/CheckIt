import React, { useState, useEffect } from 'react';
import { ScrollView, Pressable, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';

export default function CPFavouritesTab() {
  const [carParks, setCarParks] = useState([]);
  const [favouriteCarParks, setFavouriteCarParks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
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

      const favCarParks = [];
      for (let carparkName in currentFavourites) {
        if (currentFavourites.hasOwnProperty(carparkName)) {
          const carparkDetails = await fetchCarparkDetails(carparkName);
          favCarParks.push({
            carparkName,
            ...carparkDetails,
            isFavourite: true,
            isOpen: false,
          });
        }
      }
      //console.log('Fetched favorites:', favCarParks); // Log fetched favorites
      setFavouriteCarParks(favCarParks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching favourites:', error);
      setLoading(false);
    }
  };

  const fetchCarparkDetails = async (carparkName) => {
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

      // Find the specific carpark 
      const carparkData = allCarParks.find(carpark => carpark.Development === carparkName);

      if (carparkData) {
        const vehicleTypeMapping = {
          C: 'Cars',
          H: 'Heavy Vehicles',
          Y: 'Motorcycles',
        };

        const vehicleTypeOrder = Object.keys(vehicleTypeMapping);

        // Create and sort vehicleTypes
        const vehicleTypes = allCarParks
          .filter(carpark => carpark.Development === carparkName)
          .map(carpark => ({
            lotType: carpark.LotType,
            spacesAvailable: carpark.AvailableLots,
          }))
          .sort((a, b) => vehicleTypeOrder.indexOf(a.lotType) - vehicleTypeOrder.indexOf(b.lotType));

        return {
          carparkName: carparkData.Development,
          area: carparkData.Area || 'Others',
          carparkID: carparkData.CarParkID,
          location: carparkData.Location,
          agency: carparkData.Agency,
          vehicleTypes: vehicleTypes,
          isFavourite: !!favouriteCarParks[carparkData.Development],
          isOpen: !!dropdownStates[carparkData.Development],
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching car park details:', error);
      return null;
    }
  };


  const saveDropdowns = async (updatedCarParks) => {
    const dropdowns = updatedCarParks.reduce((acc, carPark) => {
      if (carPark.isOpen) {
        acc[carPark.carparkName] = true;
      }
      return acc;
    }, {});

    await AsyncStorage.setItem('CPdropdowns', JSON.stringify(dropdowns));
  };

  const closeAllDropdowns = () => {
    setCarParks(prevCarParks => {
      const updatedCarParks = prevCarParks.map(carPark => ({ ...carPark, isOpen: false }));
      saveDropdowns(updatedCarParks);
      return updatedCarParks;
    });
  };

  const toggleDropdown = (carparkName) => {
    setFavouriteCarParks(prevCarParks => {
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

  const toggleFavourite = async (carparkName) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    const userId = user.uid;
    const favouriteRef = doc(db, 'users', userId, 'favorites', 'carParks');

    try {
      const docSnapshot = await getDoc(favouriteRef);
      let currentFavourites = {};
      if (docSnapshot.exists()) {
        currentFavourites = docSnapshot.data().favorites || {};
      }

      if (currentFavourites[carparkName]) {
        delete currentFavourites[carparkName];

        await setDoc(favouriteRef, { favorites: currentFavourites });
        console.log('Updated favorites:', currentFavourites);

        setFavouriteCarParks(prevCarParks => {
          return prevCarParks.filter(carpark => carpark.carparkName !== carparkName);
        });
      } else {
        console.error('Carpark not found in favorites:', carparkName);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

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
        <CarParkList
          carParks={favouriteCarParks}
          toggleFavourite={toggleFavourite}
          toggleDropdown={toggleDropdown}
        />
      </LinearGradient>
    </ScrollView>
  );
}

const CarParkList = ({ carParks, toggleFavourite, toggleDropdown }) => {
  const lotTypeMapping = {
    C: 'Cars',
    H: 'Heavy Vehicles',
    Y: 'Motorcycles',
  };

  if (carParks.length === 0) {
    return (
      <View style={styles.noResults}>
        <Text style={styles.noResultsText}>Tap on a red heart to add to favourites!</Text>
      </View>
    );
  }

  return (
    <View>
      {carParks.map((carPark, index) => (
        <View key={index} style={styles.carParkWrapper}>
          <View style={styles.carParkContainer}>
            <Pressable style={styles.iconButton} onPress={() => toggleFavourite(carPark.carparkName)}>
              <HeartIcon filled={carPark.isFavourite} />
            </Pressable>
            <Pressable style={styles.carParkDetails} onPress={() => toggleDropdown(carPark.carparkName)}>
              <Text style={styles.carParkNumber}>Carpark: {carPark.carparkName}</Text>
              <Text style={styles.shortName}>Area: {carPark.area}</Text>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => fetchCarparkDetails(carPark.carparkName)}>
              <FontAwesome5 name="sync-alt" size={24} color="black" />
            </Pressable>
          </View>
          {carPark.isOpen && (
            <View style={styles.dropdownContent}>
              <Text style={styles.carParkAvail}>Available Lots</Text>
              {carPark.vehicleTypes && carPark.vehicleTypes.map((vehicle, i) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  iconButton: {
    padding: 8,
  },
  dropdownContent: {
    backgroundColor: '#FFFFF0',
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
  },
});