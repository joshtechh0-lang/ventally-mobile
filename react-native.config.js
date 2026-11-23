module.exports = {
    project: {
      ios: {},
      android: {},
    },
    assets: ['./src/assets/fonts'], // adjust according to your path
    dependencies: {
      'react-native-iap': {
        platforms: {
          android: null, // disable on Android
        },
      },
    },
  };