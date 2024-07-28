import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from '@expo/vector-icons';
import MaterialIconTextbox from "./components/MaterialIconTextbox";
import MaterialIconTextbox1 from "./components/MaterialIconTextbox1";
import MaterialIconTextbox2 from "./components/MaterialIconTextbox2";
import MaterialIconTextbox3 from "./components/MaterialIconTextbox3";
import MaterialIconTextbox4 from "./components/MaterialIconTextbox4";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "./lib/firebase";
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc } from "firebase/firestore";

const Header = () => {
  return (
    <View style={styles.header}>
      <Ionicons name="chevron-back" size={28} color="white" />
      <Text style={styles.headerText}>Profile</Text>
      <Ionicons name="chevron-forward" size={28} color="white" />
    </View>
  );
};

const Profile = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadCredentials = async () => {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPassword = await AsyncStorage.getItem('password');
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedEmail && storedPassword && storedUsername) {
        setEmail(storedEmail);
        setPassword(storedPassword);
        setUsername(storedUsername);
      }
    };
    loadCredentials();
  }, []);

  const updateUserProfile = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const Username = await AsyncStorage.getItem('username');
      const Contact = await AsyncStorage.getItem('contact');
      const Gender = await AsyncStorage.getItem('gender');
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          email: email,
          password: password,
          username: Username,
          contact: Contact,
          gender: Gender
        });
  
        alert('Profile updated successfully!');
      } else {
        alert('No user is logged in!');
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header/>
      <Icon name="person" style={styles.icon} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.rect2}>
          <View style={styles.rect3} />
          <View style={styles.materialIconTextboxStack}>
            <MaterialIconTextbox style={styles.materialIconTextbox} />
            <MaterialIconTextbox1 style={styles.materialIconTextbox13} email={email}/>
          </View>
          <View style={styles.rect4} />
          <View style={styles.rect5} />
          <MaterialIconTextbox2 style={styles.materialIconTextbox2} password={password}/>
          <View style={styles.rect6} />
          <View style={styles.materialIconTextbox3Stack}>
            <MaterialIconTextbox3 style={styles.materialIconTextbox3} />
            <MaterialIconTextbox4 style={styles.materialIconTextbox4} />
          </View>
          <View style={styles.rect7} />
          <View style={styles.rect8} />
        </View>
        <TouchableOpacity onPress={updateUserProfile} style={styles.button}>
          <Text style={styles.saveChanges}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,1)",
  },
  header: {
    backgroundColor: '#4682B4',
    padding: 10,
    marginBottom: 8,
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
  icon: {
    position: "absolute",
    top: 100,
    marginLeft:150,
    color: "rgba(74,144,226,1)",
    fontSize: 90,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  rect2: {
    marginTop: 220,
    width: "100%",
    backgroundColor: "white",
    alignItems: "center",
  },
  rect3: {
    flex: 0.17,
    backgroundColor: "rgba(255,255,255,1)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    elevation: 5,
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  materialIconTextboxStack: {
    width: "100%",
    height: 114,
    alignItems: "center",
  },
  materialIconTextbox: {
    height: 59,
    width: "80%",
  },
  materialIconTextbox13: {
    height: 56,
    width: "80%",
    backgroundColor: "rgba(255,255,255,1)",
  },
  rect4: {
    flex: 0.13,
    backgroundColor: "rgba(255,255,255,1)",
  },
  rect5: {
    flex: 0.17,
    backgroundColor: "rgba(222, 222, 222,1)",
  },
  materialIconTextbox2: {
    height: 56,
    width: "80%",
    backgroundColor: "rgba(255,255,255,1)",
  },
  rect6: {
    flex: 0.17,
    backgroundColor: "rgba(248, 248, 248,1)",
  },
  materialIconTextbox3Stack: {
    width: "100%",
    height: 119,
    alignItems: "center",
  },
  materialIconTextbox3: {
    height: 58,
    width: "80%",
    backgroundColor: "rgba(255,255,255,1)",
  },
  materialIconTextbox4: {
    height: 62,
    width: "80%",
    backgroundColor: "#fff",
  },
  rect7: {
    flex: 0.17,
    backgroundColor: "rgba(245, 245, 245,1)",
  },
  rect8: {
    flex: 0.21,
    backgroundColor: "rgba(255,255,255,1)",
  },
  button: {
    bottom: 20,
    height: 63,
    width: "80%",
    backgroundColor: "rgba(70,130,180,1)",
    borderWidth: 0,
    borderColor: "#000000",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginTop:30
  },
  saveChanges: {
    color: "rgba(255,255,255,1)",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Profile;
