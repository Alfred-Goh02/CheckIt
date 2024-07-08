import React, { useState, useEffect } from 'react';
import { Pressable, View, Text, StyleSheet, Image, StatusBar, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/Authprovider';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (user) {
      navigation.navigate('Home');
    }
  }, [user, navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const success = await signIn(email, password);
      if (success) {
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.mainContainer}>
        <StatusBar backgroundColor='gray' barStyle="light-content" />
        <View style={styles.welcomeContainer}>
          <Image style={styles.welcomeImage} source={require('../assets/CIcon.png')} />
        </View>
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Login</Text>
          <View style={styles.textfieldContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder='Type your username'
              autoCapitalize='none'
              keyboardType='email-address'
            />
          </View>
          <View style={styles.pwtextfieldcontainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder='Type your password'
            />
          </View>
          <View style={styles.forgotpwContainer}>
            <Pressable onPress={() => Alert.alert('Forgot Password', 'Password recovery not implemented yet.')}>
              <Text style={styles.forgotpwText}>Forgot Password?</Text>
            </Pressable>
          </View>
          <View style={styles.LoginButtonContainer}>
            <Pressable onPress={handleLogin} disabled={loading}>
              <GradientButton loading={loading} />
            </Pressable>
          </View>
          <View style={styles.signUpcontainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const GradientButton = ({ loading }) => (
  <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={gradientButtonStyles.button}>
    <Text style={gradientButtonStyles.buttonText}>{loading ? 'Logging in ...' : 'Log in'}</Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column"
  },
  welcomeContainer: {
    marginTop: 10,
    alignContent: "center",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  welcomeImage: {
    height: 100,
    width: 100,
  },
  loginContainer: {
    flexDirection: "column",
    width: 350,
    flex: 0.8,
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
  },
  loginTitle: {
    fontWeight: 'bold',
    fontSize: 30,
    marginTop: 20,
  },
  textfieldContainer: {
    flexDirection: "column",
    marginTop: 30,
  },
  pwtextfieldcontainer: {
    flexDirection: "column",
  },
  inputLabel: {
    marginLeft: 15,
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    height: 40,
    width: 270,
    margin: 12,
    borderBottomWidth: 1,
    fontSize: 16,
  },
  forgotpwContainer: {
    flexDirection: "row",
    alignSelf: 'flex-end',
    marginRight: 40,
  },
  forgotpwText: {
    opacity: 0.6,
    fontSize: 16,
    fontWeight: "bold",
  },
  LoginButtonContainer: {
    flex: 0.2,
    alignItems: "center",
  },
  signUpcontainer: {
    flexDirection: "row",
    flex: 0.05,
  },
  signUpText: {
    opacity: 0.5,
    fontSize: 16,
  },
  signUpLink: {
    marginLeft: 5,
    opacity: 0.5,
    fontWeight: "bold",
    textDecorationLine: 'underline',
    fontSize: 16,
  }
});

const gradientButtonStyles = StyleSheet.create({
  button: {
    marginTop: 20,
    padding: 15,
    width: 270,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
