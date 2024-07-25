import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput,TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

const Forgotpw = () => {
    const [email, setEmail] = useState('');

    const handlePW= async () => {
        if (!email){
            Alert.alert("Please key in your Email")
        }
        else{
        await sendPasswordResetEmail(getAuth(), email)
        .then(()=>{
            Alert.alert('Recovery Email has been sent')
        })
    }
    };

    return (
        <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.pwcontainer}>
                    <Text style={styles.emailtxt}>
                        Email
                    </Text>
                    <TextInput
                        style={styles.email}
                        placeholder='Type your email'
                        onChangeText={newText => setEmail(newText)}
                        keyboardType='email-address' 
                    />
                    <View style={{justifyContent:'center', alignItems:'center', width:280}}>
                    <TouchableOpacity onPress={handlePW} >
                    <GradientButton/>
                    </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const resetPW = async() => {}

const GradientButton = ({ loading }) => (
    <LinearGradient colors={["#B0E0E6", "#4682B4"]} style={styles.button}>
      <Text style={styles.buttonText}>{loading ? 'Sending Email . . .' : 'Reset Password'}</Text>
    </LinearGradient>
  );


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    pwcontainer: {
        //flex:40,
        backgroundColor: 'white',
        borderRadius: 20,
        flexDirection: 'column',
        marginLeft: 20,
        marginRight: 20,
        alignItems: 'flex-start',
        padding: 10,
        height:250,
        width:300,
        justifyContent:'flex-start'
    },
    emailtxt: {
        marginBottom: 10,
        fontSize: 17,
        fontWeight: 'bold'
    },
    email: {
        marginTop:5,
        borderBottomWidth: 1,
        width: '100%',
    },
    button:{
        marginTop:60,
        justifyContent:'center',
        alignItems:'center',
        padding: 10,
        borderRadius:10,
        width:280
    },
    buttonText:{
        fontWeight:'500',
        fontSize:20
    }
});

export default Forgotpw;
