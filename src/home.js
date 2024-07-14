import React, { useEffect } from 'react';
import { FontAwesome, FontAwesome5, Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, View, Text, StyleSheet, Image, StatusBar, SafeAreaView, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from './Authprovider';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Profile from './Profile';
import Settings from './settings';

const Logomodal = () => (
  <View style={styles.container}>
    <Image style={styles.tinyLogo} source={require('../assets/CIcon.png')} />
    <View style={styles.modal}>
      <Link href="/modal" asChild>
        <Pressable>
          {({ pressed }) => (
            <FontAwesome name="info-circle" size={40} style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }} />
          )}
        </Pressable>
      </Link>
    </View>
  </View>
);

const Welcomeuser = ({ navigation }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.welcomeContainer}>
      <Text style={styles.welcomeText}>Welcome back!</Text>
      <Text style={styles.userText}>User</Text>
      <View style={styles.logoutContainer}>
        <Pressable onPress={handleSignOut}>
          <Entypo name="log-out" size={30} color="black" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const Icons = ({ navigation }) => (
  <View style={styles.iconsContainer}>
    <View style={styles.iconWrapper}>
      <Pressable onPress={() => navigation.navigate("Carpark")}>
        <FontAwesome name="car" size={50} color="white" />
        <Text style={styles.iconText}>Parking</Text>
      </Pressable>
    </View>
    <View style={styles.iconWrapper}>
      <Pressable onPress={() => navigation.navigate("BusTime")}>
        <FontAwesome5 name="bus" size={50} color="white" />
        <Text style={styles.iconText}>Bus</Text>
      </Pressable>
    </View>
    <View style={styles.iconWrapper}>
      <Pressable onPress={() => navigation.navigate("Taxi")}>
        <FontAwesome5 name="taxi" size={50} color="white" />
        <Text style={styles.iconText}>Taxi</Text>
      </Pressable>
    </View>
  </View>
);

const BtmIcons = ({ navigation }) => (
  <View style={styles.btmIconsContainer}>
    <Pressable style={styles.btmIconWrapper} onPress={() => navigation.navigate("Settings")}>
      <Ionicons name="settings-sharp" size={30} color="white" />
      <Text style={styles.btmIconText}>Settings</Text>
    </Pressable>
    <Pressable style={styles.btmIconWrapper} onPress={() => navigation.navigate("Home")}>
      <Entypo name="home" size={30} color="white" />
      <Text style={styles.btmIconText}>Home</Text>
    </Pressable>
    <Pressable style={styles.btmIconWrapper} onPress={() => navigation.navigate("Profile")}>
      <AntDesign name="user" size={30} color="white" />
      <Text style={styles.btmIconText}>Profile</Text>
    </Pressable>
  </View>
);

const BtmTab = createBottomTabNavigator();

const TabLayout = ({ navigation }) => {
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  return (

      <BtmTab.Navigator initialRouteName='Home' tabBar={props => <TabBar {...props} />} screenOptions={{headerShown:false}}>
        <BtmTab.Screen name="Home" component={Homescreen} />
        <BtmTab.Screen name="Profile" component={Profile} />
        <BtmTab.Screen name="Settings" component={Settings} />
      </BtmTab.Navigator>

  );
};

function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.btmIconsContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityStates={isFocused ? ['selected'] : []}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.btmIconWrapper}
          >
            <Ionicons name={label === 'Settings' ? 'settings-sharp' : label === 'Home' ? 'home' : 'person'} size={30} color={isFocused ? 'white' : 'gray'} />
            <Text style={[styles.btmIconText, { color: isFocused ? 'white' : 'gray' }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const Homescreen = ({ navigation }) => {
  return (
    <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor='gray' barStyle="light-content" />
        <Welcomeuser navigation={navigation} />
        <Icons navigation={navigation} />
      </SafeAreaView>
    </LinearGradient>
  );
} 

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: "center",
    marginTop: 10,
  },
  tinyLogo: {
    height: 100,
    width: 100,
  },
  modal: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#CFE2F3',
    height: 100,
    padding: 10,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
    color: 'black',
    marginRight: 5,
  },
  userText: {
    fontSize: 25,
    color: '#444EC1',
    fontWeight: "bold",
    marginLeft: 3,
  },
  logoutContainer: {
    marginLeft: 'auto',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 230,
    backgroundColor: "rgba(80, 82 , 108, 0.3)",
    borderRadius: 20,
    paddingVertical: 20,
  },
  iconWrapper: {
    flex: 0.333,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconText: {
    color: "white",
    textAlign: 'center',
    marginTop: 5,
    fontSize: 15,
  },
  btmIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: "#282c34",
    paddingVertical: 10,
    paddingHorizontal: 20,
    //borderTopLeftRadius: 20,
    //borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  btmIconWrapper: {
    alignItems: 'center',
  },
  btmIconText: {
    color: 'white',
    marginTop: 5,
  },
});

export default TabLayout;
