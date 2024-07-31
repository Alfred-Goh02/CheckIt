import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { render, fireEvent,waitFor } from '@testing-library/react-native';
import Carpark from '../carparks';
import NavigationWrapper from './mocks/navigationWrapper';
import { NavigationContainer } from '@react-navigation/native';

// Create an instance of MockAdapter to mock axios requests
const mock = new MockAdapter(axios);

describe('Carpark API test', () => {
  // Restore the mock adapter after each test
  afterEach(() => {
    mock.restore();
  });

  it('should fetch data successfully with axios', async () => {
    const mockData = {
      data: {
        value: [
          {
            "CarParkID": "1",
            "Area": "Marina",
            "Development": "Suntec City",
            "Location": "1.29375 103.85718",
            "AvailableLots": 1415,
            "LotType": "C",
            "Agency": "LTA"
          }
        ]
      }
    };

    mock.onGet('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2').reply(200, mockData);

    const response = await axios.get('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2');

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });  
});


describe('Carpark render', ()=>{
    it('should render back button', async () => {
        const { getByTestId } = render(
          <NavigationContainer>
            <Carpark />
          </NavigationContainer>
        );
    
        // Wait for the component to render and check if the refresh button is present
        await waitFor(() => expect(getByTestId('back-button')).toBeTruthy());
      });
    
      it('should handle favourites button', async () => {
        const { getByTestId } = render(
          <NavigationContainer>
            <Carpark />
          </NavigationContainer>
        );
    
        // Wait for the refresh button to be in the DOM
        await waitFor(() => expect(getByTestId('favorites-button')).toBeTruthy());
    
        // Simulate button press and check for desired outcomes
        // Add more logic here to test the refresh button functionality
      });

      it('should render header text', async () => {
        const { getByTestId } = render(
          <NavigationContainer>
            <Carpark />
          </NavigationContainer>
        );
    
        // Wait for the refresh button to be in the DOM
        await waitFor(() => expect(getByTestId('header-text')).toBeTruthy());
    
        // Simulate button press and check for desired outcomes
        // Add more logic here to test the refresh button functionality
      });
      it('should render search bar input', async () => {
        const { getByTestId } = render(
          <NavigationContainer>
            <Carpark />
          </NavigationContainer>
        );
    
        // Wait for the refresh button to be in the DOM
        await waitFor(() => expect(getByTestId('search-bar-input')).toBeTruthy());
    
        // Simulate button press and check for desired outcomes
        // Add more logic here to test the refresh button functionality
      });
})