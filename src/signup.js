import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '@firebase/auth';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);
        try {
            const auth = getAuth();
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert('Success', 'Sign up successful!');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
            <LinearGradient colors={["#F838D5", "#38C7F8"]} style={styles.mainContainer}>
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
        <LinearGradient colors={["#F838D5", "#38C7F8"]} style={styles.button}>
            <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign up'}</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    signupContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        width: 300,
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    textfieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontWeight: "bold",
        marginBottom: 5,
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
        color: 'white',
        fontSize: 16,
        fontWeight: "bold"
    },
});

export default Signup;
