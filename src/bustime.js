import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Pressable, View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db, auth } from './lib/firebase';

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

export default function BusStop() {

    // State variables
    const [busStops, setBusStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [location, setLocation] = useState(null);
    const [dropdownStates, setDropdownStates] = useState({});
    const busStopsPerPage = 10;

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status != 'granted') {
                console.log("Permission Denied");
                return;
            }
            let location = await Location.getCurrentPositionAsync();
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        })();
    }, []);

    // Fetch data from the Bus Stop API
    const fetchData = async () => {
        try {
            let allBusStops = [];
            let skipValue = 0;
            const batchSize = 500;
            let toContinue = true;

            while (toContinue) {
                const response = await axios.get(`http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skipValue}`, {
                    headers: {
                        'AccountKey': 'X0n+k8P5S5u2bnIoUx6pKw==',
                        'Accept': 'application/json',
                    },
                });

                const busStopData = response.data.value;

                if (busStopData.length > 0) {
                    allBusStops = allBusStops.concat(busStopData);
                    skipValue += batchSize;
                } else {
                    toContinue = false;
                }
            }

            const dropdowns = await AsyncStorage.getItem('busStopDropdowns');
            const savedDropdownStates = dropdowns ? JSON.parse(dropdowns) : {};

            // Fetch favorites from Firestore
            const user = auth.currentUser;
            let favouriteBusStops = {};
            if (user) {
                const userId = user.uid;
                const favouriteRef = doc(db, 'users', userId, 'favorites', 'busStops');
                const docSnapshot = await getDoc(favouriteRef);
                if (docSnapshot.exists()) {
                    favouriteBusStops = docSnapshot.data().favorites || {};
                }
            }

            const formattedBusStops = allBusStops.map(stop => ({
                name: stop.Description,
                codeName: stop.BusStopCode,
                roadName: stop.RoadName,
                latitude: stop.Latitude,
                longitude: stop.Longitude,
                isFavourite: !!favouriteBusStops[stop.BusStopCode], 
                isOpen: !!savedDropdownStates[stop.BusStopCode], 
            }));

            setDropdownStates(savedDropdownStates);
            setBusStops(formattedBusStops);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bus stop info:', error);
            setLoading(false);
        }
    };

    // Fetch data on component mount and set interval for auto-refresh
    useEffect(() => {
        fetchData();
        const interval = setInterval(refreshBusStop, 10000); // Fetch data every 10 secs

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    // Ensure favourites are synced
    useFocusEffect(
        useCallback(() => {
        fetchData();
        }, [])
    );

    // Filter nearby bus stops
    const filterNearbyBusStops = () => {
        if (location) {
            const nearbyBusStops = busStops.filter(stop => {
                const distance = getDistanceFromLatLonInKm(
                    location.latitude,
                    location.longitude,
                    stop.latitude,
                    stop.longitude
                );
                return distance <= 2;
            });
            setBusStops(nearbyBusStops);
        } else {
            console.log('No location data available');
            return;
        }
    };

    // Fetch data from the bus arrival API
    const fetchArrival = async (busStopCode) => {
        try {
            const response = await axios.get(`http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2`, {
                params: {
                    BusStopCode: busStopCode,
                },
                headers: {
                    'AccountKey': 'X0n+k8P5S5u2bnIoUx6pKw==',
                    'Accept': 'application/json',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching arrival data:', error);
            return null;
        }
    };

    // Process bus stop details
    const processBusStopDetails = (response) => {
        if (response && response.Services) {
            const sortedServices = sortBusServices(response.Services.map(service => ({
                serviceNo: service.ServiceNo,
                operator: service.Operator,
                nextBuses: [
                    {
                        estimatedArrival: service.NextBus.EstimatedArrival,
                        load: service.NextBus.Load,
                        feature: service.NextBus.Feature,
                        type: service.NextBus.Type,
                    },
                    {
                        estimatedArrival: service.NextBus2.EstimatedArrival,
                        load: service.NextBus2.Load,
                        feature: service.NextBus2.Feature,
                        type: service.NextBus2.Type,
                    },
                    {
                        estimatedArrival: service.NextBus3.EstimatedArrival,
                        load: service.NextBus3.Load,
                        feature: service.NextBus3.Feature,
                        type: service.NextBus3.Type,
                    }
                ]
            })));

            return sortedServices;
        } else {
            return [];
        }
    };

    // Save dropdown states to AsyncStorage
    const saveDropdowns = async (updatedBusStops) => {
        const dropdowns = updatedBusStops.reduce((acc, busStop) => {
            if (busStop.isOpen) {
                acc[busStop.codeName] = true;
            }
            return acc;
        }, {});
    
        await AsyncStorage.setItem('busStopDropdowns', JSON.stringify(dropdowns));
    };

    // Toggle favourite state of a bus stop
    const toggleFavourite = async (codeName) => {
        const user = auth.currentUser;
        if (!user) {
            console.error("User is not authenticated.");
            return;
        }

        const userId = user.uid;
        const favouriteRef = doc(db, 'users', userId, 'favorites', 'busStops');
        const docSnapshot = await getDoc(favouriteRef);

        let currentFavourites = {};
        if (docSnapshot.exists()) {
            currentFavourites = docSnapshot.data().favorites || {};
        }

        if (currentFavourites[codeName]) {
            delete currentFavourites[codeName];
        } else {
            currentFavourites[codeName] = true;
        }

        await setDoc(favouriteRef, { favorites: currentFavourites });

        console.log("Updated Favourites:", currentFavourites); // Debugging log

        setBusStops(prevBusStops => {
            if (!Array.isArray(prevBusStops)) {
                return prevBusStops;
            }

            const updatedBusStops = prevBusStops.map(busStop => {
                if (busStop.codeName === codeName) {
                    const updatedBusStop = { ...busStop, isFavourite: !busStop.isFavourite };
                    console.log("Toggled Bus Stop:", updatedBusStop); // Debugging log
                    return updatedBusStop;
                }
                return busStop;
            });

            return updatedBusStops;
        });
    };

    // Toggle dropdown state of a bus stop and fetch bus arrival details
    const toggleDropdown = async (busStopCode) => {
        setBusStops(prevBusStops => {
            const updatedBusStops = prevBusStops.map(busStop => {
                if (busStop.codeName === busStopCode) {
                    busStop.isOpen = !busStop.isOpen;
                    if (busStop.isOpen && !busStop.details) {
                        busStop.loadingDetails = true;
                    }
                }
                return busStop;
            });
            saveDropdowns(updatedBusStops); 
            return updatedBusStops;
        });
    
        if (busStopCode) {
            try {
                const response = await fetchArrival(busStopCode);
                const data = processBusStopDetails(response);
    
                setBusStops(prevBusStops => {
                    const updatedBusStops = prevBusStops.map(busStop => {
                        if (busStop.codeName === busStopCode) {
                            return { ...busStop, details: data, loadingDetails: false };
                        }
                        return busStop;
                    });
                    saveDropdowns(updatedBusStops); 
                    return updatedBusStops;
                });
            } catch (error) {
                console.error('Error fetching data for bus stop:', error);
                setBusStops(prevBusStops => {
                    const updatedBusStops = prevBusStops.map(busStop => {
                        if (busStop.codeName === busStopCode) {
                            return { ...busStop, loadingDetails: false };
                        }
                        return busStop;
                    });
                    saveDropdowns(updatedBusStops); 
                    return updatedBusStops;
                });
            }
        }
    };

    // Function to refresh data
    const refreshBusStop = async (busStopCode) => {
        setBusStops(prevBusStops => {
            const updatedBusStops = prevBusStops.map(busStop => {
                if (busStop.codeName === busStopCode) {
                    busStop.loadingDetails = true;
                }
                return busStop;
            });
            return updatedBusStops;
        });

        if (busStopCode) {
            try {
                const response = await fetchArrival(busStopCode);
                const data = processBusStopDetails(response);

                setBusStops(prevBusStops => {
                    const updatedBusStops = prevBusStops.map(busStop => {
                        if (busStop.codeName === busStopCode) {
                            return { ...busStop, details: data, loadingDetails: false };
                        }
                        return busStop;
                    });
                    saveDropdowns(updatedBusStops); 
                    return updatedBusStops;
                });
            } catch (error) {
                console.error('Error fetching data for bus stop:', error);
                setBusStops(prevBusStops => {
                    const updatedBusStops = prevBusStops.map(busStop => {
                        if (busStop.codeName === busStopCode) {
                            return { ...busStop, loadingDetails: false };
                        }
                        return busStop;
                    });
                    return updatedBusStops;
                });
            }
        }
    };

    // Handle search query change
    const handleSearchChange = (query) => {
        setSearchQuery(query);

        // Close all dropdowns when search query changes
        setBusStops(prevBusStops =>
            prevBusStops.map(busStop => ({ ...busStop, isOpen: false }))
        );
    };

    // Function to close all dropdowns
    const closeAllDropdowns = () => {
        setBusStops(prevBusStops =>
            prevBusStops.map(busStop => ({ ...busStop, isOpen: false }))
        );
    };

    // Filter bus stops based on the search query
    const filteredBusStops = busStops.filter(busStop =>
        busStop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        busStop.codeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Paginate the filtered bus stops
    const displayedBusStops = filteredBusStops.slice(0, currentPage * busStopsPerPage);

    // Load more bus stops when pressed
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
                    <SearchBar value={searchQuery} onChangeText={handleSearchChange} />
                    <Pressable style={styles.loadNearbyButton} onPress={filterNearbyBusStops}>
                        <Ionicons name="location-sharp" size={34} color="white" />
                    </Pressable>
                </View>
                <BusStopList
                    busStops={displayedBusStops}
                    toggleFavourite={toggleFavourite}
                    toggleDropdown={toggleDropdown}
                    refreshBusStop={refreshBusStop}
                />
                {filteredBusStops.length > displayedBusStops.length && (
                    <Button title="Load More" onPress={handleLoadMore} />
                )}
            </LinearGradient>
        </ScrollView>
    );
};

// Sort Bus Service Numbers in alphabumerical order
const sortBusServices = (services) => {
    return services.sort((a, b) => {
        const regex = /^(\d+)(\D*)$/;
        const [, numA, suffixA] = a.serviceNo.match(regex);
        const [, numB, suffixB] = b.serviceNo.match(regex);

        if (numA === numB) {
            return suffixA.localeCompare(suffixB);
        }
        return parseInt(numA) - parseInt(numB);
    });
};

// Header component
const Header = ({ closeAllDropdowns }) => {
    const navigation = useNavigation();

    // Handle navigation back press
    const handleBackPress = () => {
        navigation.goBack();
    };

    // Handle navigation to Favorites page
    const handleFavoritesPress = () => {
        closeAllDropdowns();
        navigation.navigate('BusFavourites');
    };

    return (
        <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={handleBackPress}>
                <Ionicons name="arrow-back" size={28} color="white" />
            </Pressable>
            <Text style={styles.headerText}>Bus Stops</Text>
            <Ionicons name="chevron-forward" size={28} color="white" />
            <Pressable style={styles.favoritesButton} onPress={handleFavoritesPress}>
                <Ionicons name="heart" size={30} color="white" />
            </Pressable>
        </View>
    );
};

const BusStopList = ({ busStops, toggleFavourite, toggleDropdown, refreshBusStop }) => {
  if (busStops.length === 0) {
    return (
      <View style={styles.noResults}>
        <Text style={styles.noResultsText}>No Bus Stops found</Text>
      </View>
    );
  }

  return (
    <View>
      {busStops.map((busStop, index) => (
        <View key={index} style={styles.busStopWrapper}>
          <View style={styles.busStopContainer}>
            <Pressable style={styles.iconButton} onPress={() => toggleFavourite(busStop.codeName)}>
              <HeartIcon filled={busStop.isFavourite} />
            </Pressable>
            <Pressable style={styles.busStopDetails} onPress={() => toggleDropdown(busStop.codeName)}>
              <View style={styles.busStopRow}>
                <Text style={styles.busStopName}>{busStop.name}</Text>
                <Text style={styles.busStopRoadName}>{busStop.roadName}</Text>
              </View>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => refreshBusStop(busStop.codeName)}>
              <Text style={styles.busStopCodeName}>{busStop.codeName}</Text>
              <FontAwesome5 name="sync-alt" size={24} color="black" style={{ marginLeft: 10 }} />
            </Pressable>
          </View>
          {busStop.isOpen && (
            <View style={styles.dropdownContent}>
              {busStop.loadingDetails ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                busStop.details && busStop.details.length > 0 ? (
                  busStop.details.map((service, idx) => (
                    <ServiceDetails key={idx} service={service} />
                  ))
                ) : (
                  <Text style={{fontSize: 16}}>No service available</Text>
                )
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const ServiceDetails = ({ service }) => {
    // Function to calculate minutes remaining for bus arrival
    const getArrivalTimeInMins = (estimatedArrival) => {
        const arrivalTime = new Date(estimatedArrival);
        const currentTime = new Date();
        const diffInMs = arrivalTime - currentTime;
        const diffInMins = Math.floor(diffInMs / 60000); // round to int (eg. 3.49 = 3)
        return diffInMins > 0 ? diffInMins : 'Arr';
    };

    // Function to determine text color based on load
    const getTextColor = (load) => {
      //  console.log('Load value:', load); 
        switch (load) {
            case 'SEA':
                return '#32CD32'; 
            case 'SDA':
                return 'orange'; 
            case 'LSD':
                return 'red'; 
            default:
                return 'black'; // if load status is unknown
        }
    };

    // Check for wheelchair access
    const hasWAB = (feature) => {
        return feature === 'WAB'; 
    };

    // Check Vehicle Type
    const getVehType = (type) => {
        switch (type) {
            case 'SD':
                return ''; // Single deck 
            case 'DD':
                return 'Double'; // Double deck
            case 'BD':
                return 'Bendy'; // Bendy 
            default:
                return ''; // Unknown
        }
    };

    return (
        <View style={styles.serviceDetails}>
            <View style={styles.serviceNameContainer}>
                <Text style={styles.serviceName}>{service.serviceNo}</Text>
                <Text style={styles.emptySpace}></Text>
            </View>
            {service.nextBuses.map((bus, index) => (
                <View key={index} style={styles.busDetails}>
                    {bus.estimatedArrival ? (
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[styles.arrivalTime, { color: getTextColor(bus.load) }]}>
                                    {getArrivalTimeInMins(bus.estimatedArrival)}
                                </Text>
                                {hasWAB(bus.feature) && (
                                    <FontAwesome5 name="wheelchair" size={16} color="black" style={{ marginLeft: 3 }} />
                                )}
                            </View>
                            <View style={styles.vehicleType}>
                                {bus.type && (
                                    <Text style={styles.vehicleType}>
                                        {getVehType(bus.type)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.arrivalTime}>-</Text>
                            <Text style={styles.emptySpace}></Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
};

const HeartIcon = ({ filled }) => (
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
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 
               3 7.5 3c1.74 0 3.41.81 4.5 2.09C 13.09 3.81 14.76 3 16.5 3 
               19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </Svg>
);

const SearchBar = ({ value, onChangeText }) => (
    <TextInput
        style={styles.searchBar}
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter bus stop name or code..."
    />
);

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
    busStopWrapper: {
        marginBottom: 16,
    },
    busStopContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFF0',
        padding: 4,
        borderRadius: 10,
    },
    busStopDetails: {
        flex: 1,
        marginLeft: 8,
    },
    busStopName: {
        fontSize: 19,
        fontWeight: 'bold',
    },
    busStopRow: {
        flexDirection: 'column',
    },
    busStopCodeName: {
        fontSize: 16,
        color: '#606060',
        marginBottom: 5,
        marginRight: 5,
    },
    busStopRoadName: {
        fontSize: 18,
        color: '#606060',
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
        marginRight: 10,
    },
    favoritesButton: {
        marginLeft: 10,
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
    serviceDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        marginBottom: 3,
    },
    serviceName: {
        fontWeight: 'bold',
        fontSize: 20,
        marginLeft: 10,
        flex: 1, // Ensures service name takes full available space
    },
    serviceNameContainer: {
        flex: 1,
    },
    busDetails: {
        flex: 1, // Ensures equal width for each bus details container
        justifyContent: 'center', // Center the content horizontally
        alignItems: 'center', // Center the content vertically
    },
    arrivalTime: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    vehicleType: {
        fontSize: 10,
        color: '#505050',
        flexDirection: 'column',
        alignItems: 'center',
        fontWeight: 'bold',
    },
    emptySpace: {
        fontSize: 10,
        flexDirection: 'column'
    },
    loadNearbyButton: {
        padding: 10,
        borderRadius: 30,
        backgroundColor: '#4682B4',
        marginLeft: 8, 
        flexShrink: 0,
      },
});