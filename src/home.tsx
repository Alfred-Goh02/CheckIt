import React from 'react';

//Font imports
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
//React native imports
import { Link } from 'expo-router';
import { Pressable, View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
//File imports


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {

    return (

        <LinearGradient colors={["#F838D5", "#38C7F8"]} style={styles.mainContainer}>
            <StatusBar backgroundColor="#F838D5" barStyle="light-content" />
            <Logomodal />
            <Welcomeuser />
            <Icons />
            <BtmIcons />
        </LinearGradient>
    );
}

const Logomodal = () => {
    return (
        <View style={styles.container}>
            <Image style={styles.tinyLogo} source={require('../assets/CIcon.png')} />
            <View style={styles.modal}>
                <Link href="/modal" asChild>
                    <Pressable>
                        {({ pressed }) => (
                            <FontAwesome
                                name="info-circle"
                                size={40}
                                style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                            />
                        )}
                    </Pressable>
                </Link>
            </View>
        </View>
    )
}

const Welcomeuser = () => {
    return (
        <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
                Welcome back!
            </Text>
            <Text style={styles.userText}>
                User
            </Text>
        </View>
    );
}

const Icons = () => {
    return (
        <View style={styles.IconsContainer}>
            <View style={styles.iconWrapper}>
                <FontAwesome name="car" size={40} color="white" />
                <Text style={styles.iconText}>
                    Parking Availability
                </Text>
            </View>
            <View style={styles.iconWrapper}>
                <FontAwesome5 name="bus" size={40} color="white" />
                <Text style={styles.iconText}>
                    Bus
                </Text>
            </View>
            <View style={styles.iconWrapper}>
                <FontAwesome5 name="taxi" size={40} color="white" />
                <Text style={styles.iconText}>
                    Taxi
                </Text>
            </View>
        </View>
    )
}

const BtmIcons = () => {
    return (
        <View style={styles.BtmIconsContainer}>
            <View style={styles.BtmIconsWrapper}>
                <Ionicons name="settings-sharp" size={60} color="white" />
                <Text style={{ color: "white" }}>
                    Settings
                </Text>
            </View>
            <View style={styles.Divider} />
            <View style={styles.BtmIconsWrapper}>
                <Entypo name="home" size={60} color="white" />
                <Text style={{ color: "white" }}>
                    Home
                </Text>
            </View>
            <View style={styles.Divider} />
            <View style={styles.BtmIconsWrapper}>
                <AntDesign name="user" size={60} color="white" />
                <Text style={{ color: "white" }}>
                    Profile
                </Text>
            </View>

        </View>
    )
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 0,
        //backgroundColor: "#1F1F23"
    },
    container: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: "center",
        flex: 0.1
    },
    tinyLogo: {
        height: 100,
        width: 100,
        alignItems: "flex-start"
    },
    modal: {
        marginLeft: 230,
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginLeft: 10,
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 25,
        marginRight: 5,
        fontFamily: "Roboto",
        fontWeight: "bold",
        color: 'white',
    },
    userText: {
        fontSize: 25,
        color: '#444EC1',
        fontFamily: "Roboto",
        fontWeight: "bold",
        marginLeft: 3,
    },
    IconsContainer: {
        flexDirection: 'row',
        //justifyContent: 'space-around',
        marginTop: 200,
        paddingTop: 30,
        paddingBottom: 20,
        backgroundColor: "rgba(80, 82 , 108, 0.3)",//"#50526C",
        borderRadius: 20,
    },
    iconWrapper: {
        marginLeft: 20,
        flex: 0.33,
        flexDirection: 'column',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 20,
        marginTop: 10,
        textAlign: 'center',
        color: "white"
    },
    BtmIconsContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        //paddingBottom: 40,
        backgroundColor: "rgba(80, 82 , 108, 0.3)",//"#50526C",
        flex: 0.2,
        flexDirection: 'row',
    },
    BtmIconsWrapper: {
        flex: 0.33,
        flexDirection: "column",
        alignItems: "center",
    },
    BtmIconsText: {
        fontSize: 20,
        marginTop: 10,
        textAlign: 'center',
        color: "white"
    },
    Divider: {
        width: 1,
        height: "100%",
        backgroundColor: "white",
        marginHorizontal: 10,
    }
});
