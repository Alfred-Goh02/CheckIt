import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, createUserWithEmailAndPassword } from '@firebase/auth';

const Signup = () => {

    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);
        try {
            const auth = getAuth(); // Get auth instance from Firebase
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert('Success', 'Sign up successful!');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <Pressable style={styles.backButton} onPress={handleBackPress}>
                        <Ionicons name="arrow-back" size={28} color="#FFFFF0" />
                    </Pressable>
                    <Text style={styles.headerText}>Sign Up</Text>
                </View>
                <View style={styles.signupContainer}>
                    <View style={styles.textfieldContainer}>
                        <Text style={styles.label}>
                            Username
                        </Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            placeholder='Type your username'
                        />
                    </View>
                    <View style={styles.textfieldContainer}>
                        <Text style={styles.label}>
                            Password
                        </Text>
                        <TextInput
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            placeholder='Type your password'
                        />
                    </View>
                    <Pressable onPress={signUpWithEmail} disabled={loading}>
                        <GradientButton loading={loading} />
                    </Pressable>
                </View>
            </LinearGradient>
        </ScrollView>
    );
};

const GradientButton = ({ loading }) => {
    return (
        <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.button}>
            <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign up'}</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingLeft: 10,
        marginTop: 20, 
        marginLeft: 8,
    },
    backButton: {
        marginRight: 10, 
    },
    headerText: {
        color: '#FFFFF0',
        fontSize: 24,
        fontWeight: 'bold',
    },
    signupContainer: {
        backgroundColor: "#FFFFF0",
        borderRadius: 20,
        width: 300,
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignSelf: 'center', 
        marginTop: 200,
    },
    textfieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontWeight: "bold",
        marginBottom: 5,
        fontSize: 16,
    },
    input: {
        height: 40,
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    button: {
        marginTop: 20,
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFF0',
        fontSize: 16,
        fontWeight: "bold"
    },
});

export default Signup;
