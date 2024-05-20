import React from 'react';

//Font imports
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
//React native imports
import { Link, useNavigation } from 'expo-router';
import { Pressable, View, Text, StyleSheet, Image, Button, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//File imports
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './types';




type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    //const navigation = useNavigation<LoginScreenNavigationProp>();
    return (
        <LinearGradient colors={["#F838D5", "#38C7F8"]} style={styles.mainContainer}>
            <StatusBar backgroundColor="#F838D5" barStyle="light-content" />
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>
                    Welcome to
                </Text>
                <Image style={styles.welcomeImage} source={require('../assets/CIcon.png')} />
            </View>
            <Button
                title='Login'
                onPress={() => navigation.navigate("Home")}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        alignItems: "center",
        //justifyContent: "center",
        flexDirection: "column"
    },
    welcomeContainer: {
        flex: 0.2,
        alignContent: "center",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        //backgroundColor: "black",
    },
    welcomeText: {
        fontWeight: "bold",
        //fontFamily: "Roboto",
        fontSize: 40,
    },
    welcomeImage: {
        height: 200,
        width: 200
    }
})

export default LoginScreen;