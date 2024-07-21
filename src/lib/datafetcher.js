import {auth, db } from './lib/firebase';
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import {useState, useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

const [userData, setUserData] = useState([])

const fetchDB = async ()=>{
    const auth = getAuth();
    const user = auth.currentUser; 
    const userRef = doc(db, 'users', user.uid);
    const Data = await getDoc(userRef);
    setUserData(Data);
    await AsyncStorage.setItem('userData', userData);
    console.log(userData.username)
}