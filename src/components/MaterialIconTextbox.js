import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

function MaterialIconTextbox(props) {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState({}); // Initialize as an object

  const handleUsername = async (newUsername) => {
    console.log('handleUsername called with:', newUsername); // Log when handleUsername is called
    setUsername(newUsername);
    try {
      await AsyncStorage.setItem('username', newUsername);
      console.log('Username saved to AsyncStorage'); // Log when saving is successful
    } catch (error) {
      console.error("Failed to save username to AsyncStorage:", error);
    }
  };

  const fetchDB = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data); // Set the entire user data object
          setUsername(data.username); // Set username for local state
          await AsyncStorage.setItem('userData', JSON.stringify(data));
          console.log('Fetched username:', data.username);
        } else {
          console.log("No such document!");
        }
      } else {
        console.log("No user is currently signed in.");
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    fetchDB();
  }, []);

  return (
    <View style={[styles.container, props.style]}>
      <Icon name="account" style={styles.iconStyle} />
      <TextInput
        placeholder="Username"
        style={styles.username}
        value={username} // Use local state for value
        onChangeText={handleUsername}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center"
  },
  iconStyle: {
    color: "rgba(144,19,254,1)",
    fontSize: 24,
    paddingLeft: 8
  },
  username: {
    color: "#000",
    marginLeft: 16,
    paddingRight: 5,
    fontSize: 16,
    alignSelf: "stretch",
    flex: 1,
    lineHeight: 16,
    borderBottomWidth: 1,
    borderColor: "#D9D5DC",
    paddingTop: 14,
    paddingBottom: 8
  }
});

export default MaterialIconTextbox;
