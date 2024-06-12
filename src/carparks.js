import React, { useState, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { Pressable, View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg'; 

import AsyncStorage from '@react-native-async-storage/async-storage';

const CarPark = ({ navigation }) => {
    const [carParks, setCarParks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const carParksPerPage = 10;

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); 

        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        const currentDateTime = new Date().toISOString(); 
s
        try {
            const [response, favs, dropdowns] = await Promise.all([
                axios.get('https://api.data.gov.sg/v1/transport/carpark-availability', {
                    params: { date_time: currentDateTime },
                }),
                AsyncStorage.getItem('favourites'),
                AsyncStorage.getItem('dropdowns'),
            ]);

            const favouriteCarParks = favs ? JSON.parse(favs) : {};
            const dropdownStates = dropdowns ? JSON.parse(dropdowns) : {};

            if (response.data && response.data.items) {
                const carparkData = response.data.items.flatMap(item =>
                    item.carpark_data.flatMap(carpark =>
                        carpark.carpark_info.map(info => ({
                            carparkNumber: carpark.carpark_number,
                            updateDatetime: carpark.update_datetime,
                            totalSpaces: parseInt(info.total_lots),
                            lotType: info.lot_type,
                            spacesAvailable: parseInt(info.lots_available),
                            isFavourite: !!favouriteCarParks[carpark.carpark_number],
                            isOpen: !!dropdownStates[carpark.carpark_number]
                        }))
                    )
                );

                setCarParks(carparkData);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const saveFavourites = async (updatedCarParks) => {
        const favourites = updatedCarParks.reduce((acc, carPark) => {
            if (carPark.isFavourite) {
                acc[carPark.carparkNumber] = true;
            }
            return acc;
        }, {});

        await AsyncStorage.setItem('favourites', JSON.stringify(favourites));
    };

    const saveDropdowns = async (updatedCarParks) => {
        const dropdowns = updatedCarParks.reduce((acc, carPark) => {
            if (carPark.isOpen) {
                acc[carPark.carparkNumber] = true;
            }
            return acc;
        }, {});

        await AsyncStorage.setItem('dropdowns', JSON.stringify(dropdowns));
    };

    const toggleFavourite = (carparkNumber) => {
        setCarParks(prevCarParks => {
            const updatedCarParks = prevCarParks.map(carpark => {
                if (carpark.carparkNumber === carparkNumber) {
                    return { ...carpark, isFavourite: !carpark.isFavourite };
                }
                return carpark;
            });

            saveFavourites(updatedCarParks);
            return updatedCarParks;
        });
    };

    const toggleDropdown = (carparkNumber) => {
        setCarParks(prevCarParks => {
            const updatedCarParks = prevCarParks.map(carpark => {
                if (carpark.carparkNumber === carparkNumber) {
                    return { ...carpark, isOpen: !carpark.isOpen };
                }
                return carpark;
            });

            saveDropdowns(updatedCarParks);
            return updatedCarParks;
        });
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCarParks(prevCarParks =>
            prevCarParks.map(carPark => ({ ...carPark, isOpen: false }))
        );
    };

    const closeAllDropdowns = () => {
        setCarParks(prevCarParks =>
            prevCarParks.map(carPark => ({ ...carPark, isOpen: false }))
        );
    };

    const filteredCarParks = carParks.filter(carPark =>
        carPark.carparkNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedCarParks = filteredCarParks.slice(0, currentPage * carParksPerPage);

    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const handleBackPress = () => {
        navigation.goBack();
        closeAllDropdowns(); 
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
            <LinearGradient colors={["#F838D5", "#38C7F8"]} style={styles.container}>
                <Pressable                style={styles.backButton} onPress={handleBackPress}>
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
};

const Header = () => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>Car Parks</Text>
        </View>
    );
};

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
                        <Pressable style={styles.iconButton} onPress={() => toggleFavourite(carPark.carparkNumber)}>
                            <HeartIcon filled={carPark.isFavourite} />
                        </Pressable>
                        <Pressable style={styles.carParkDetails} onPress={() => toggleDropdown(carPark.carparkNumber)}>
                            <Text style={styles.carParkNumber}>Carpark: {carPark.carparkNumber}</Text>
                            <Text style={styles.shortName}>Code: {carPark.carparkNumber}</Text>
                        </Pressable>
                        <Pressable style={styles.iconButton} onPress={fetchData}>
                            <FontAwesome5 name="sync-alt" size={24} color="black" />
                        </Pressable>
                    </View>
                    {carPark.isOpen && (
                        <View style={styles.dropdownContent}>
                            <Text style={styles.carParkType}>Type: {carPark.lotType}</Text>
                            <Text style={styles.carParkAvailability}>Available: {carPark.spacesAvailable}</Text>
                            <Text style={styles.carParkTotal}>Total: {carPark.totalSpaces}</Text>
                            <Text style={styles.carParkUpdate}>Updated: {carPark.updateDatetime}</Text>
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
            4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C 13.09 3.81 14.76 3 
            16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </Svg>
    );
};

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
    carParkTotal: {
        fontSize: 16,
        color: '#707070',
    },
    carParkUpdate: {
        fontSize: 14,
        color: '#A0A0A0',
    },
    shortName: {
        fontSize: 15,
        color: "#606060",
        backgroundColor: 'rgba(128, 128, 128, 0.1)', 
        borderRadius: 5,
        paddingVertical: 1, 
        paddingHorizontal: 5
        ,
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

export default CarPark;

