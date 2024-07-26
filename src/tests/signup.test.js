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

    it('displays success alert on successful sign-up', async () => {
        const mockEmail = 'test@example.com';
        const mockPassword = 'password123';

        // Ensure the mock is correctly defined
        firebaseAuth.createUserWithEmailAndPassword.mockResolvedValueOnce({});

        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <Signup />
            </NavigationContainer>
        );

        // Simulate user input
        fireEvent.changeText(getByPlaceholderText('Type your email'), mockEmail);
        fireEvent.changeText(getByPlaceholderText('Type your password'), mockPassword);

        // Simulate button press
        fireEvent.press(getByText('Sign up'));

        // Wait for the sign-up process to complete
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Sign up successful!');
        });
    });

    it('displays error alert on sign-up failure', async () => {
        const mockEmail = 'test@example.com';
        const mockPassword = 'password123';
        const mockErrorMessage = 'Sign up failed';

        // Ensure the mock is correctly defined
        firebaseAuth.createUserWithEmailAndPassword.mockRejectedValueOnce(new Error(mockErrorMessage));

        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <Signup />
            </NavigationContainer>
        );

        // Simulate user input
        fireEvent.changeText(getByPlaceholderText('Type your email'), mockEmail);
        fireEvent.changeText(getByPlaceholderText('Type your password'), mockPassword);

        // Simulate button press
        fireEvent.press(getByText('Sign up'));

        // Wait for the sign-up process to complete
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', mockErrorMessage);
        });
    });
});
