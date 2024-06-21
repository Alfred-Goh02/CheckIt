import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from './lib/firebase';
import { Alert } from 'react-native';

const AuthContext = createContext({
  user: null,
  signIn: () => { },
  signOut: () => { }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Error signing in:', error);
      if (error) {
        return (
          Alert.alert('Invalid Login Credentials')
        )
      }
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
