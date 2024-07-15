// lib/firebase.js or lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, onAuthStateChanged, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
