// jestSetup.js

jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockMapView = (props) => <View {...props} />;
    const MockMarker = (props) => <View {...props} />;
    return {
        __esModule: true,
        default: MockMapView,
        Marker: MockMarker,
        Callout: (props) => <View {...props} />,
        PROVIDER_GOOGLE: 'google',
    };
});

jest.mock('react-native-gesture-handler', () => {
    const actual = jest.requireActual('react-native-gesture-handler');
    return {
      ...actual,
      GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
  });