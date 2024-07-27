import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Signup from '../signup';
import { NavigationContainer } from '@react-navigation/native';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase functions and initialization
jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
}));

// Mock Alert.alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

describe('Signup Screen', () => {
    it('renders the Signup Screen correctly', () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Signup />
            </NavigationContainer>
        );
        expect(getByText('Sign Up')).toBeTruthy();
        expect(getByText('Email')).toBeTruthy();
        expect(getByText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Type your email')).toBeTruthy();
        expect(getByPlaceholderText('Type your password')).toBeTruthy();
    });

});
