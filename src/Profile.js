import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import Svg, { Ellipse } from "react-native-svg";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIconTextbox from "./components/MaterialIconTextbox";
import MaterialIconTextbox1 from "./components/MaterialIconTextbox1";
import MaterialIconTextbox2 from "./components/MaterialIconTextbox2";
import MaterialIconTextbox3 from "./components/MaterialIconTextbox3";
import MaterialIconTextbox4 from "./components/MaterialIconTextbox4";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = (props) => {
  return (
    <SafeAreaView style={styles.container}>
    
      <Icon name="person" style={styles.icon} />
    
      {/* Main Content */}
      <View style={styles.rect2}>
        <View style={styles.rect3} />
        <View style={styles.materialIconTextboxStack}>
          <MaterialIconTextbox style={styles.materialIconTextbox} />
          <MaterialIconTextbox1 style={styles.materialIconTextbox13} />
        </View>
        <View style={styles.rect4} />
        <View style={styles.rect5} />
        <MaterialIconTextbox2 style={styles.materialIconTextbox2} />
        <View style={styles.rect6} />
        <View style={styles.materialIconTextbox3Stack}>
          <MaterialIconTextbox3 style={styles.materialIconTextbox3} />
          <MaterialIconTextbox4 style={styles.materialIconTextbox4} />
        </View>
        <View style={styles.rect7} />
        <View style={styles.rect8} />
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity
        onPress={() => props.navigation.navigate("Untitled")}
        style={styles.button}
      >
        <Text style={styles.saveChanges}>Save Changes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,1)",
    alignItems: "center",
  },
  ellipse: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(74,144,226,1)",
    borderRadius: 50,
    transform: [
    {scaleX: 4}
]
  },
  ellipse2: {
    position: "absolute",
    top: 127,
    left: 127,
    width: 127,
    height: 127,
  },
  icon: {
    position: "absolute",
    top: 100,
    color: "rgba(74,144,226,1)",
    fontSize: 90,
  },
  rect2: {
    marginTop: 220, // Adjust the marginTop to create space for the ellipse
    width: "100%",
    height: 340,
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
    position: "absolute",
    backgroundColor: "rgba(70,130,180,1)",
    borderWidth: 0,
    borderColor: "#000000",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  saveChanges: {
    color: "rgba(255,255,255,1)",
    fontSize: 20,
    fontWeight: "bold",
    position:"absolute"
  },
});

export default Profile;
