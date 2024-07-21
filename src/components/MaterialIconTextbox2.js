import React from "react";
import { StyleSheet, View, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

function MaterialIconTextbox2({ password }) {
  return (
    <View style={styles.container}>
      <Icon name="asterisk" style={styles.iconStyle} />
      <TextInput
        placeholder="Password"
        secureTextEntry={false}
        style={styles.inputStyle}
        value={password}
        editable={false}
        color="#D9D5DC"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft:40,
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

export default MaterialIconTextbox2;
