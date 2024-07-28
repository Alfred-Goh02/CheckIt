import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Button } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const BusFavouritesTab = () => {
    const [loading, setLoading] = useState(true);
    const [busStops, setBusStops] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const busStopsPerPage = 10;

    useEffect(() => {
        fetchFavourites();
        const interval = setInterval(refreshBusStop, 10000); // Fetch data every 10 secs

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);
    
    const fetchFavourites = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error("User is not authenticated.");
                setLoading(false);
                return;
            }
    
            const userId = user.uid;
            const favouriteRef = doc(db, "users", userId, "favorites", "busStops");
            const docSnapshot = await getDoc(favouriteRef);
    
            let currentFavourites = {};
            if (docSnapshot.exists()) {
                currentFavourites = docSnapshot.data().favorites || {};
            }
    
            const favBusStops = await Promise.all(Object.keys(currentFavourites).map(busStopCode => fetchData(busStopCode)));
            const validBusStops = favBusStops.filter(busStop => busStop && busStop.codeName && busStop.name && busStop.latitude && busStop.longitude);
    
            if (favBusStops.length !== validBusStops.length) {
                console.warn('Some bus stops were missing information and were excluded.');
            }
    
            setBusStops(validBusStops.map(busStop => ({
                ...busStop,
                isFavourite: true,
                isOpen: false,
            })));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching favourites:', error);
            setLoading(false);
        }
    };

    const fetchAllBusStops = async () => {
        let allBusStops = [];
        let hasMoreData = true;
        let skip = 0;
        const limit = 500; // Number of items per request
    
        while (hasMoreData) {
            try {
                const response = await axios.get('http://datamall2.mytransport.sg/ltaodataservice/BusStops', {
                    headers: {
                        'AccountKey': 'X0n+k8P5S5u2bnIoUx6pKw==',
                        'Accept': 'application/json',
                    },
                    params: {
                        $skip: skip,
                        $top: limit
                    }
                });
    
                const busStops = response.data.value;
                allBusStops = allBusStops.concat(busStops);
                
                hasMoreData = busStops.length === limit;
                skip += limit;
            } catch (error) {
                console.error('Error fetching bus stops:', error);
                hasMoreData = false;
            }
        }
        return allBusStops;
    };
    
    let busStopsCache = [];

    const fetchData = async (busStopCode) => {
        if (busStopsCache.length === 0) {
            busStopsCache = await fetchAllBusStops();
        }

        const busStopData = busStopsCache.find(stop => stop.BusStopCode === busStopCode);

        if (busStopData) {
            return {
                name: busStopData.Description,
                codeName: busStopData.BusStopCode,
                roadName: busStopData.RoadName,
                latitude: busStopData.Latitude,
                longitude: busStopData.Longitude,
            };
        } else {
            console.warn(`Bus stop with code ${busStopCode} not found.`);
            return null;
        }
    };

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

    const saveDropdowns = async (updatedBusStops) => {
        const dropdowns = updatedBusStops.reduce((acc, busStop) => {
            if (busStop.isOpen) {
                acc[busStop.codeName] = true;
            }
            return acc;
        }, {});
    
        await AsyncStorage.setItem('busStopDropdowns', JSON.stringify(dropdowns));
    };

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

    // Toggle favourite state of a bus stop
    const toggleFavourite = async (busStopCode) => {
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
    
        if (currentFavourites[busStopCode]) {
            delete currentFavourites[busStopCode];
        } else {
            currentFavourites[busStopCode] = true;
        }
    
        // Save the updated favorites to Firestore
        await setDoc(favouriteRef, { favorites: currentFavourites });
    
        setBusStops(prevBusStops => {
            if (!Array.isArray(prevBusStops)) {
                return prevBusStops;
            }
    
            const updatedBusStops = prevBusStops.map(busStop => {
                if (busStop.codeName === busStopCode) {
                    return { ...busStop, isFavourite: !busStop.isFavourite };
                }
                return busStop;
            });
    
            return updatedBusStops;
        });
    };    

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

    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const displayedBusStops = busStops.slice(0, currentPage * busStopsPerPage);

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
                <BusStopList
                    busStops={displayedBusStops}
                    toggleFavourite={toggleFavourite}
                    toggleDropdown={toggleDropdown}
                    refreshBusStop={refreshBusStop}
                    fetchData={fetchData}
                />
                {busStops.length > displayedBusStops.length && (
                    <Button title="Load More" onPress={handleLoadMore} />
                )}
            </LinearGradient>
        </ScrollView>
    );
};

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

const Header = () => {
    const navigation = useNavigation();

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={handleBackPress}>
                <Ionicons name="arrow-back" size={28} color="white" />
            </Pressable>
            <Text style={styles.headerText}>Favourites</Text>
            <Ionicons name="chevron-forward" size={28} color="white" />
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
        flex: 1, 
    },
    serviceNameContainer: {
        flex: 1,
    },
    busDetails: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
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
});

export default BusFavouritesTab;