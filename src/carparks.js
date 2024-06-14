import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { Pressable, View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* Left with using firebase and settle the close dropdowns permanently when search or click back to homepage 
 *Also to set favourites as the first few to pop out ? 
 *Create env to hide API account key ? */ 

// Main CarPark component
export default function CarPark() {
  // Navigation hook
  const navigation = useNavigation();

  // State variables
  const [carParks, setCarParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const carParksPerPage = 10;

  // Fetch data on component mount and set interval for auto-refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Fetch data every 60 secs

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const [response, favs, dropdowns] = await Promise.all([
        axios.get('http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2', {
          headers: {
            'AccountKey': 'X0n+k8P5S5u2bnIoUx6pKw==',
            'accept': 'application/json',
          },
        }),
        AsyncStorage.getItem('favourites'),
        AsyncStorage.getItem('dropdowns'),
      ]);

      const favouriteCarParks = favs ? JSON.parse(favs) : {};
      const dropdownStates = dropdowns ? JSON.parse(dropdowns) : {};

      if (response.data && response.data.value) {
        const carparkData = response.data.value.map(carpark => ({
          carparkName: carpark.Development, // Use development as carpark name
          area: carpark.Area,
          location: carpark.Location, // longitude
          spacesAvailable: carpark.AvailableLots,
          lotType: carpark.LotType,
          agency: carpark.Agency, // LTA or HDB etc
          isFavourite: !!favouriteCarParks[carpark.Development], // Check if it's a favourite
          isOpen: !!dropdownStates[carpark.Development], // Check if dropdown is open
        }));

        setCarParks(carparkData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Save favourites to AsyncStorage
  const saveFavourites = async (updatedCarParks) => {
    const favourites = updatedCarParks.reduce((acc, carPark) => {
      if (carPark.isFavourite) {
        acc[carPark.carparkName] = true;
      }
      return acc;
    }, {});

    await AsyncStorage.setItem('favourites', JSON.stringify(favourites));
  };

  // Save dropdown states to AsyncStorage
  const saveDropdowns = async (updatedCarParks) => {
    const dropdowns = updatedCarParks.reduce((acc, carPark) => {
      if (carPark.isOpen) {
        acc[carPark.carparkName] = true;
      }
      return acc;
    }, {});

    await AsyncStorage.setItem('dropdowns', JSON.stringify(dropdowns));
  };

  // Toggle favourite state of a car park
  const toggleFavourite = (carparkName) => {
    setCarParks(prevCarParks => {
      const updatedCarParks = prevCarParks.map(carpark => {
        if (carpark.carparkName === carparkName) {
          return { ...carpark, isFavourite: !carpark.isFavourite };
        }
        return carpark;
      });

      saveFavourites(updatedCarParks);
      return updatedCarParks;
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

    // Close all dropdowns when search query changes
    setCarParks(prevCarParks =>
      prevCarParks.map(carPark => ({ ...carPark, isOpen: false }))
    );
  };

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setCarParks(prevCarParks =>
      prevCarParks.map(carPark => ({ ...carPark, isOpen: false }))
    );
  };

  // Filter car parks based on the search query
  const filteredCarParks = carParks.filter(carPark =>
    carPark.carparkName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate the filtered car parks
  const displayedCarParks = filteredCarParks.slice(0, currentPage * carParksPerPage);

  // Load more car parks when the load more button is pressed
  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  // Handle navigation back press and close all dropdowns
  const handleBackPress = () => {
    navigation.goBack();
    closeAllDropdowns();
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
      <LinearGradient colors={["#F838D5", "#38C7F8"]} style={styles.container}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </Pressable>
        <Header />
        <SearchBar value={searchQuery} onChangeText={handleSearchChange} />
        <CarParkList
          carParks={displayedCarParks}
          toggleFavourite={toggleFavourite}
          toggleDropdown={toggleDropdown}
          fetchData={fetchData}
        />
        {filteredCarParks.length > displayedCarParks.length && (
          <Button title="Load More" onPress={handleLoadMore} />
        )}
      </LinearGradient>
    </ScrollView>
  );
}

// Header component for the car park page
const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Car Parks</Text>
    </View>
  );
};

// List component to display car parks
const CarParkList = ({ carParks, toggleFavourite, toggleDropdown, fetchData }) => {
  if (carParks.length === 0) {
    return (
      <View style={styles.noResults}>
        <Text style={styles.noResultsText}>No Carparks found</Text>
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
            <Pressable style={styles.iconButton} onPress={fetchData}>
              <FontAwesome5 name="sync-alt" size={24} color="black" />
            </Pressable>
          </View>
          {carPark.isOpen && (
            <View style={styles.dropdownContent}>
              <Text style={styles.carParkType}>Type: {carPark.lotType}</Text>
              <Text style={styles.carParkAvailability}>Available: {carPark.spacesAvailable}</Text>
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
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: '#F838D5',
    padding: 5,
    marginBottom: 8,
    marginLeft: 5,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  carParkWrapper: {
    marginBottom: 16,
  },
  carParkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E1',
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
  carParkType: {
    fontSize: 16,
    color: '#707070',
  },
  carParkAvailability: {
    fontSize: 16,
    color: '#707070',
  },
  shortName: {
    fontSize: 15,
    color: "#606060",
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 5,
    paddingVertical: 1,
    paddingHorizontal: 5,
    width: 'fit-content',
    alignSelf: 'flex-start',
  },
  searchBar: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 12,
    borderRadius: 30,
    fontSize: 16,
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
    top: 10,
    left: 10,
    zIndex: 10,
    marginBottom: 10,
  },
  iconButton: {
    padding: 8,
  },
  dropdownContent: {
    backgroundColor: 'white',
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
  },
});
