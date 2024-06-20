import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { Pressable, View, Text, StyleSheet, Image, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
//import { Button } from 'react-native-elements';
import { useAuth } from './Authprovider';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
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
  );
}

const Welcomeuser = ({ navigation }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigation.replace('Login');
  };


  return (
    <SafeAreaView style={styles.welcomeContainer}>

      <Text style={styles.welcomeText}>
        Welcome back!
      </Text>
      <Text style={styles.userText}>
        User
      </Text>
      <SafeAreaView style={{color:"black", justifyContent:'flex-end', flexDirection:'row', flex:1}}>
      <Pressable onPress={handleSignOut}>
        <Entypo name="log-out" size={30} color="black" style={{marginTop: 2 }} />
      </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const Icons = ({ navigation }) => {
  const [pressed, setPressed]=useState(false);
  return (
    <View style={styles.IconsContainer}>
      <View style={[styles.iconCar, pressed && styles.iconPressed]}>
        <Pressable onPressIn={()=>setPressed(true)} 
        onPressOut={() => {setPressed(false);navigation.navigate("Carpark");} }>
          <FontAwesome name="car" size={40} color="white" />
          <Text style={styles.parkingText}  > Parking </Text>
        </Pressable>
      </View>
      <View style={styles.iconWrapper}>
        <Pressable onPress={() => navigation.navigate("BusTime")}>
          <FontAwesome5 name="bus" size={40} color="white" />
          <Text style={styles.iconText}>
            Bus
          </Text>
        </Pressable>
      </View>
      <View style={styles.iconWrapper}>
        <Pressable onPress={() => navigation.navigate("Taxi")}>
          <FontAwesome5 name="taxi" size={40} color="white" />
          <Text style={styles.iconText}>
            Taxi
          </Text>
        </Pressable>
      </View>
      </View>
  );
}

const BtmIcons = () => {
  return (
    <View style={styles.BtmIconsContainer}>
      <View style={styles.BtmIconsWrapper}>
        <Ionicons name="settings-sharp" size={50} color="white" />
        <Text style={{ color: "white" }}>
          Settings
        </Text>
      </View>
      <View style={styles.Divider} />
      <View style={styles.BtmIconsWrapper}>
        <Entypo name="home" size={50} color="white" />
        <Text style={{ color: "white" }}>
          Home
        </Text>
      </View>
      <View style={styles.Divider} />
      <View style={styles.BtmIconsWrapper}>
        <AntDesign name="user" size={50} color="white" />
        <Text style={{ color: "white" }}>
          Profile
        </Text>
      </View>
    </View>
  );
}

const TabLayout = ({ navigation }) => {
  useEffect(() => {
    const backAction = () => {
      // Disable Android back button
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  
  return (
    <LinearGradient colors={["#F838D5", "#38C7F8"]} style={styles.mainContainer}>
      <SafeAreaView style={{flex:1}}>
      <StatusBar backgroundColor="#F838D5" barStyle="light-content" />
      <Welcomeuser navigation={navigation} />
      <Icons navigation={navigation} />
      <BtmIcons />
      </SafeAreaView>
    </LinearGradient>
  );
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
    //justifyContent: 'center',
    marginTop: 200,
    //paddingTop: 30,
    //paddingBottom: 20,
    backgroundColor: "rgba(80, 82 , 108, 0.3)",
    borderRadius: 20,
    flex: 0.3
  },
  iconWrapper: {
    //marginRight: 30,
    flex:0.333,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center'
  },
  iconCar: {
    flex: 0.333,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent:'center',
  },
  iconText: {
    fontSize: 15,
    textAlign: 'center',
    color: "white",
    //marginRight:10,
  },
  parkingText:{
    fontSize: 15,
    textAlign: 'center',
    color: "white",
    //marginRight:10,
  },
  BtmIconsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(80, 82 , 108, 0.3)",
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
  },
  iconPressed:{
    flex: 0.333,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent:'center',
    backgroundColor:'rgba(60, 62, 88, 0.3)'
  }
});

export default TabLayout;
