import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

function MaterialIconTextbox4(props) {
  const [gender, setGender] = useState('');

  const handleGender = async (newGender) => {
    console.log('handleGender called with:', newGender);
    setGender(newGender);
    try {
      await AsyncStorage.setItem('gender', newGender);
      console.log('Gender saved to AsyncStorage');
    } catch (error) {
      console.error("Failed to save gender to AsyncStorage:", error);
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
          setGender(data.gender || ''); // Set gender from user data
          await AsyncStorage.setItem('gender', JSON.stringify(data.gender || ''));
          console.log('Fetched gender:', data.gender);
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
      <Icon name="account-multiple" style={styles.iconStyle} />
      <TextInput
        placeholder="Gender"
        style={styles.inputStyle}
        value={gender}
        onChangeText={handleGender}
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

export default MaterialIconTextbox4;
