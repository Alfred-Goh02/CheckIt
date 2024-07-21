// lib/firebase.js or lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, onAuthStateChanged, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFT-Y8bIF85epS42MA1XIyXuTx2ljpbco",
  authDomain: "checkit-9fb84.firebaseapp.com",
  projectId: "checkit-9fb84",
  storageBucket: "checkit-9fb84.appspot.com",
  messagingSenderId: "881533226358",
  appId: "1:881533226358:web:1c598120755daa5a253e57",
  measurementId: "G-C5MT85WN4Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, db };
