import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';



const BusTime = ({ navigation }) => {
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
            <LinearGradient colors={["#F838D5", "#38C7F8"]} style={styles.container}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
               <Ionicons name="arrow-back" size={28} color="white" />
            </Pressable>
                <Header />
                <SearchBar />
                <BusStops />
            </LinearGradient>
        </ScrollView>
    );
}

const Header = () => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>Bus Stops</Text>
        </View>
    );
};

const BusStops = () => {
    // State to manage which bus stops are open
    const [selectedBusStops, setSelectedBusStops] = useState([]);
 
    const busStops = [
        {
            name: "Bukit Panjang Interchange",
            shortName: "BP INT",
            distance: 190,
            buses: [
                { busno: 960, timings: [3, 7, 13] },
                { busno: 972, timings: [5, 10, 15] },
            ]
        },
        {
            name: "Clementi Interchange",
            shortName: "Clementi INT",
            distance: 200,
            buses: [
                { busno: 96, timings: [5, 8, 15] },
                { busno: 184, timings: [6, 12, 18] },
            ]
        },
        {
            name: "Opposite NUH",
            shortName: "Opp NUH",
            distance: 300,
            buses: [
                { busno: 95, timings: [2, 11, 20] },
                { busno: 151, timings: [7, 14, 21] },
            ]
        },
    ];

    // Handle opening multiple dropdowns
    const handleSelectBusStop = (index) => {
        setSelectedBusStops(prevSelectedBusStops =>
            prevSelectedBusStops.includes(index)
                ? prevSelectedBusStops.filter(stop => stop !== index)
                : [...prevSelectedBusStops, index]
        );
    };

    return (
        <View>
            {busStops.map((busStop, index) => (
                <View key={index}>
                    <BusStop
                        name={busStop.name}
                        shortName={busStop.shortName}
                        distance={busStop.distance}
                        buses={busStop.buses}
                        isOpen={selectedBusStops.includes(index)}
                        onSelectBusStop={() => handleSelectBusStop(index)}
                    />
                </View>
            ))}
        </View>
    );
};

const BusStop = ({ name, shortName, distance, buses, isOpen, onSelectBusStop }) => {
    const [isFavourited, setIsFavourited] = useState(false);

    // Toggle favourite state
    const toggleFavourite = () => {
        setIsFavourited(!isFavourited);
    };

    return (
        <View style={styles.busStopWrapper}>
            <View style={styles.busStopContainer}>
                <Pressable style={styles.iconButton} onPress={toggleFavourite}>
                    <HeartIcon filled={isFavourited} />
                </Pressable>
                <Pressable style={styles.busStopDetails} onPress={onSelectBusStop}>
                    <View style={styles.busStopRow}>
                        <Text style={styles.busStopName}>{name}</Text>
                        <Text style={styles.busStopDistance}>{distance}m</Text>
                    </View>
                    <Text style={styles.busStopShortName}>{shortName}</Text>
                </Pressable>
                <Pressable style={styles.iconButton}>
                    <FontAwesome5 name="sync-alt" size={24} color="black" />
                </Pressable>
            </View>
            {isOpen && (
                <View style={styles.dropdownContent}>
                    {buses && buses.map((bus, busIndex) => (
                        <View key={busIndex} style={styles.busTimingContainer}>
                            <Text style={styles.busNumber}>Bus {bus.busno}</Text>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                {bus.timings.map((timing, index) => (
                                    <Text key={index} style={styles.timingText}>{timing} min</Text>
                                ))}
                            </ScrollView>
                        </View>
                    ))}
                </View>
            )}
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
            4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 
            19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </Svg>
    );
};

const SearchBar = ({ value, onChangeText }) => {
    return (
        <TextInput
            style={styles.searchBar}
            value={value}
            onChangeText={onChangeText}
            placeholder="Search bus stops..."
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
    headerText:{
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    busStopWrapper: {
        marginBottom: 16,
    },
    busStopContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE4E1',
        padding: 8,
        borderRadius: 10,
    },
    busStopDetails: {
        flex: 1,
        marginLeft: 8,
    },
    busStopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    busStopName: {
        fontSize: 18,
    },
    busStopDistance: {
        fontSize: 16,
    },
    busStopShortName: {
        fontSize: 16,
        color: '#707070',
    },
    iconButton: {
        padding: 8,
    },
    searchBar: {
        backgroundColor: 'white',
        padding: 10,
        marginBottom: 12,
        borderRadius: 30,
        fontSize: 16,
    },
    dropdownContent: {
        backgroundColor: 'white',
        padding: 10,
        marginTop: 5,
        borderRadius: 10,
    },
    busTimingContainer: {
        marginBottom: 8,
    },
    busNumber: {
        marginLeft: 15,
        fontSize: 20,
    },
    timingText: {
        marginLeft: 26, // Padding to shift text to the right
        fontSize: 18,
        flexDirection: 'row', 
        alignItems: 'center', 
        width: 100, // Adjust width as needed for uniform spacing
    },
    backButton: {
        top: 10,
        left: 10,
        zIndex: 10,
        marginBottom: 10,
    },
});

export default BusTime;

