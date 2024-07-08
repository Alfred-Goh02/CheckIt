import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Pressable, View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function BusStop() {
    const navigation = useNavigation();

    // State variables
    const [busStops, setBusStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const busStopsPerPage = 10;

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Fetch data every 60 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
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

            const [favs, dropdowns] = await Promise.all([
                AsyncStorage.getItem('busStopFavourites'),
                AsyncStorage.getItem('busStopDropdowns'),
            ]);

            const favouriteBusStops = favs ? JSON.parse(favs) : {};
            const dropdownStates = dropdowns ? JSON.parse(dropdowns) : {};

            const formattedBusStops = allBusStops.map(stop => ({
                name: stop.Description,
                codeName: stop.BusStopCode,
                roadName: stop.RoadName,
                latitude: stop.Latitude,  // lat and long not used but just kept for ref
                longitude: stop.Longitude,
                isFavourite: !!favouriteBusStops[stop.Description],
                isOpen: !!dropdownStates[stop.Description],
            }));

            setBusStops(formattedBusStops);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bus stop info:', error);
            setLoading(false);
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
            return response.Services.map(service => ({
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
            }));
        } else {
            return [];
        }
    };

    // Save favourites to AsyncStoragea
    const saveFavourites = async (updatedBusStops) => {
        const favourites = updatedBusStops.reduce((acc, busStop) => {
            if (busStop.isFavourite) {
                acc[busStop.name] = true;
            }
            return acc;
        }, {});

        await AsyncStorage.setItem('busStopFavourites', JSON.stringify(favourites));
    };

    // Save dropdown states to AsyncStorage
    const saveDropdowns = async (updatedBusStops) => {
        const dropdowns = updatedBusStops.reduce((acc, busStop) => {
            if (busStop.isOpen) {
                acc[busStop.name] = true;
            }
            return acc;
        }, {});

        await AsyncStorage.setItem('busStopDropdowns', JSON.stringify(dropdowns));
    };

    // Toggle favourite state of a bus stop
    const toggleFavourite = (name) => {
        setBusStops(prevBusStops => {
            const updatedBusStops = prevBusStops.map(busStop => {
                if (busStop.name === name) {
                    return { ...busStop, isFavourite: !busStop.isFavourite };
                }
                return busStop;
            });

            saveFavourites(updatedBusStops);
            return updatedBusStops;
        });
    };

    // Toggle dropdown state of a bus stop and fetch bus arrival details
    const toggleDropdown = async (name, busStopCode) => {
        setBusStops(prevBusStops => {
            return prevBusStops.map(busStop => {
                if (busStop.name === name) {
                    busStop.isOpen = !busStop.isOpen;
                    if (busStop.isOpen && !busStop.details) {
                        busStop.loadingDetails = true;
                    }
                }
                return busStop;
            });
        });

        if (busStopCode) {
            try {
                const response = await fetchArrival(busStopCode);
                const data = processBusStopDetails(response);

                setBusStops(prevBusStops => {
                    return prevBusStops.map(busStop => {
                        if (busStop.name === name) {
                            return { ...busStop, details: data, loadingDetails: false };
                        }
                        return busStop;
                    });
                });
            } catch (error) {
                console.error('Error fetching data for bus stop:', error);
                setBusStops(prevBusStops => {
                    return prevBusStops.map(busStop => {
                        if (busStop.name === name) {
                            return { ...busStop, loadingDetails: false };
                        }
                        return busStop;
                    });
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
            <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.container}>
                <Pressable style={styles.backButton} onPress={handleBackPress}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </Pressable>
                <Header />
                <SearchBar value={searchQuery} onChangeText={handleSearchChange} />
                <BusStopList
                    busStops={displayedBusStops}
                    toggleFavourite={toggleFavourite}
                    toggleDropdown={toggleDropdown}
                />
                {filteredBusStops.length > displayedBusStops.length && (
                    <Button title="Load More" onPress={handleLoadMore} />
                )}
            </LinearGradient>
        </ScrollView>
    );
}

// Header component
const Header = () => (
    <View style={styles.header}>
        <Text style={styles.headerText}>Bus Stops</Text>
    </View>
);

const BusStopList = ({ busStops, toggleFavourite, toggleDropdown }) => {
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
                        <Pressable style={styles.iconButton} onPress={() => toggleFavourite(busStop.name)}>
                            <HeartIcon filled={busStop.isFavourite} />
                        </Pressable>
                        <Pressable style={styles.busStopDetails} onPress={() => toggleDropdown(busStop.name, busStop.codeName)}>
                            <View style={styles.busStopRow}>
                                <Text style={styles.busStopName}>{busStop.name}</Text>
                                <Text style={styles.busStopRoadName}>{busStop.roadName}</Text>
                            </View>
                        </Pressable>
                        <Pressable style={styles.iconButton} onPress={() => toggleDropdown(busStop.name, busStop.codeName)}>
                            <Text style={styles.busStopCodeName}>{busStop.codeName}</Text>
                            <FontAwesome5 name="sync-alt" size={24} color="black" style={{ marginLeft: 10 }} />
                        </Pressable>
                    </View>
                    {busStop.isOpen && !busStop.loadingDetails && busStop.details && busStop.details.length > 0 && (
                        <View style={styles.dropdownContent}>
                            {busStop.details.map((service, idx) => (
                                <ServiceDetails key={idx} service={service} />
                            ))}
                        </View>
                    )}
                    {busStop.loadingDetails && (
                        <View style={styles.dropdownContent}>
                            <ActivityIndicator size="small" color="#0000ff" />
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
            <Text style={styles.serviceName}>{service.serviceNo}</Text>
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
                        <Text style={styles.arrivalTime}>-</Text>
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
    },
    headerText: {
        color: '#FFFFF0',
        fontSize: 24,
        fontWeight: 'bold',
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
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        borderRadius: 5,
        paddingVertical: 1,
        paddingHorizontal: 2,
        width: 'fit-content',
        alignSelf: 'flex-start',
        marginTop: 1,
    },
    searchBar: {
        backgroundColor: '#FFFFF0',
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
});
