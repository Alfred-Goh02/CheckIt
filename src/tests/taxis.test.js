import React from 'react';
import renderer from 'react-test-renderer';
import {getDistanceFromLatLonInKm} from "../taxis"

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

  it('Returns 0 if same coordinates are given',()=>{
    const lat1 = 23;
    const lon1 = 23;
    const lat2 = 23;
    const lon2 = 23;

    expect(getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2)).toBeCloseTo(0);
  });
});
