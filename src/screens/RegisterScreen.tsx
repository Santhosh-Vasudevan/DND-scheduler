import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useAuth} from '../context/AuthContext';

GoogleSignin.configure({
  webClientId:
    '163246190332-e1ecm5aaflfsti85p0pdc4j5vqd726jd.apps.googleusercontent.com', // Full Web Client ID
  offlineAccess: true, // For refreshing tokens
  forceCodeForRefreshToken: true,
});

const RegisterScreen = ({navigation}: any) => {
  const {setUser} = useAuth();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle DOB Picker
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  // Handle Manual Registration
  const handleRegister = async () => {
    if (!name) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return;
    }
    if (!email) {
      Alert.alert('Missing Information', 'Please enter your email address.');
      return;
    }
    if (!password) {
      Alert.alert('Missing Information', 'Please enter the password.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!dob) {
      Alert.alert('Missing Information', 'Please select your date of birth.');
      return;
    }
    if (!gender) {
      Alert.alert('Missing Information', 'Please select your gender.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address!');
      return;
    }
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Registration Successful', [
        {text: 'OK', onPress: () => navigation.navigate('Login')},
      ]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Registration Failed', error.message);
      } else {
        Alert.alert('Registration Failed', 'An unknown error occurred.');
      }
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const {type, data}: any = await GoogleSignin.signIn();
      if (!data.idToken) throw new Error('No ID Token received');
      if (type === 'success') {
        const googleCredential = auth.GoogleAuthProvider.credential(
          data.idToken,
        ); // Create a Google credential with the token
        await auth().signInWithCredential(googleCredential); // Sign in the user with the credential
        setUser(true);
      } else if (type === 'cancelled') {
        Alert.alert('Cancelled', 'User Cancelled SignIn', [
          {text: 'OK', onPress: () => navigation.navigate('Home')},
        ]);
      }
    } catch (error: unknown) {
      console.error(error);
      Alert.alert('Google Sign-In Failed', 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.input}>
        <Text style={{color: dob ? '#333' : '#888'}}>
          {dob ? dob.toDateString() : 'Select Date of Birth'}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={dob || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <View style={styles.genderContainer}>
        <TouchableOpacity
          onPress={() => setGender('Male')}
          style={[
            styles.genderButton,
            gender === 'Male' ? styles.selectedGender : {},
          ]}>
          <Text
            style={gender === 'Male' ? styles.selectedText : styles.genderText}>
            Male
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setGender('Female')}
          style={[
            styles.genderButton,
            gender === 'Female' ? styles.selectedGender : {},
          ]}>
          <Text
            style={
              gender === 'Female' ? styles.selectedText : styles.genderText
            }>
            Female
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}>
        <Text style={styles.buttonText}>Sign Up with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    backgroundColor: '#fff',
    elevation: 2,
    justifyContent: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  genderButton: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
  },
  selectedGender: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  genderText: {
    color: '#333',
    fontSize: 16,
  },
  selectedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  googleButton: {
    backgroundColor: '#DB4437',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#555',
    fontSize: 16,
  },
});

export default RegisterScreen;
