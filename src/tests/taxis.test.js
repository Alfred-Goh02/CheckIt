import React from 'react';
import renderer from 'react-test-renderer';
import { getDistanceFromLatLonInKm } from "../taxis"
import * as Location from 'expo-location';
import axios from 'axios';
import Taxi from '../taxis';
import { render, waitFor } from '@testing-library/react-native';

describe('Coordinates to KM', () => {
  it('Converts the distance of the coordinate correctly ', () => {
    //Test 1
    lat1 = 52.5200;
    lon1 = 13.4050;
    lat2 = 48.8566;
    lon2 = 2.3522;

    distance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);

    expect(distance).toBeCloseTo(877, 0);

    //Test 2
    lat1 = 1.290270;
    lon1 = 103.851959;
    lat2 = 31.2304;
    lon2 = 121.4737;

    distance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);

    expect(distance).toBeCloseTo(3810, 0);

    //Test 3
    lat1 = 1.290270;
    lon1 = 103.851959;
    lat2 = 51.5072;
    lon2 = 0.1276;

    distance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);

    expect(distance).toBeCloseTo(10838, 0);
  });

  it('Returns 0 if same coordinates are given', () => {
    const lat1 = 23;
    const lon1 = 23;
    const lat2 = 23;
    const lon2 = 23;

    expect(getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2)).toBeCloseTo(0);
  });
});

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock axios
jest.mock('axios');

describe('Taxi Screen', () => {
  beforeAll(() => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 1.3521, longitude: 103.8198 }
    });

    axios.request
      .mockResolvedValueOnce({
        data: { value: [{ Latitude: 1.3521, Longitude: 103.8198 }] }
      })
      .mockResolvedValueOnce({
        data: { value: [{ Latitude: 1.3521, Longitude: 103.8198, Name: 'Stand 1', Ownership: 'Public', Type: 'Normal' }] }
      });
  });

  it('renders correctly and displays the map with markers', async () => {
    const { getByTestId } = render(<Taxi />);

    await waitFor(() => {
      expect(getByTestId('map')).toBeTruthy();
    });

    // Check if the location marker is displayed
    await waitFor(() => {
      expect(getByTestId('you-are-here-marker')).toBeTruthy();
    });

    // Check if the taxi marker is displayed
    await waitFor(() => {
      expect(getByTestId('taxi-marker')).toBeTruthy();
    });

    // Check if the taxi stand marker is displayed
    await waitFor(() => {
      expect(getByTestId('stand-marker')).toBeTruthy();
    });
  }, 10000); // Increase timeout to 10 seconds

  it('displays the loading indicator initially', () => {
    const { getByTestId } = render(<Taxi />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});