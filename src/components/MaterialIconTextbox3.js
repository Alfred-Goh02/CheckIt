import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

function MaterialIconTextbox3(props) {
  const [contact, setContact] = useState('');

  const handleContact = async (newContact) => {
    console.log('handleContact called with:', newContact);
    setContact(newContact);
    try {
      await AsyncStorage.setItem('contact', newContact);
      console.log('Contact saved to AsyncStorage');
    } catch (error) {
      console.error("Failed to save contact to AsyncStorage:", error);
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
          setContact(data.contact || ''); // Set contact from user data
          await AsyncStorage.setItem('contact', JSON.stringify(data.contact || ''));
          console.log('Fetched contact:', data.contact);
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
      <Icon name="account-box-multiple" style={styles.iconStyle} />
      <TextInput
        placeholder="Contact"
        style={styles.inputStyle}
        value={contact}
        onChangeText={handleContact}
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
  inputStyle: {
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

export default MaterialIconTextbox3;
