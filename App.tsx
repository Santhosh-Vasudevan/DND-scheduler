import React, {useEffect} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {AuthProvider} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId:
  //       '163246190332-e1ecm5aaflfsti85p0pdc4j5vqd726jd.apps.googleusercontent.com',
  //     offlineAccess: true, // Optional: to get a refresh token
  //   });
  // }, []);

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
