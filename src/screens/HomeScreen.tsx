import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {VolumeManager} from 'react-native-volume-manager';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../context/AuthContext';

const ScheduleVolumeManager = ({navigation}: any) => {
  const {setUser} = useAuth();
  const [startTime, setStartTime] = useState<any>(new Date());
  const [endTime, setEndTime] = useState<any>(new Date());
  const [showStartPicker, setShowStartPicker] = useState<any>(false);
  const [showEndPicker, setShowEndPicker] = useState<any>(false);
  const [isSchedulerEnabled, setIsSchedulerEnabled] = useState<any>(false);
  const [activationLocked, setActivationLocked] = useState<any>(false);

  useEffect(() => {
    const loadIsActivationDisabled = async () => {
      try {
        const savedState = await AsyncStorage.getItem('activationLocked');
        if (savedState !== null) {
          setActivationLocked(Boolean(JSON.parse(savedState)));
        }
      } catch (error) {
        console.error('Failed to load activation state', error);
      }
    };
    loadIsActivationDisabled();
  }, []);

  const onStartChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || startTime;
    setShowStartPicker(false);
    setStartTime(currentDate);
  };

  const onEndChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || endTime;
    setShowEndPicker(false);
    setEndTime(currentDate);
  };

  const handleSchedulerToggle = () =>
    setIsSchedulerEnabled((previousState: any) => !previousState);

  const handleSilentModeToggle = async () => {
    if (isSchedulerEnabled && !activationLocked) {
      const user = auth().currentUser;
      if (!user) throw new Error('User not found');
      setActivationLocked(true);
      const now = new Date();
      const startDelay = startTime.getTime() - now.getTime();
      const endDelay = endTime.getTime() - now.getTime();

      // Set a background timer to activate silent mode at the start time
      if (startDelay > 0) {
        BackgroundTimer.setTimeout(async () => {
          await VolumeManager.setVolume(0, {
            type: 'ring',
            showUI: true,
            playSound: true,
          });
          await VolumeManager.setVolume(0, {
            type: 'notification',
            showUI: true,
            playSound: true,
          });
          await VolumeManager.setVolume(0, {
            type: 'music',
            showUI: true,
            playSound: true,
          });
          handleSaveSchedule(user.uid);
        }, startDelay);
      } else {
        await VolumeManager.setVolume(0, {
          type: 'ring',
          showUI: true,
          playSound: true,
        });
        await VolumeManager.setVolume(0, {
          type: 'notification',
          showUI: true,
          playSound: true,
        });
        await VolumeManager.setVolume(0, {
          type: 'music',
          showUI: true,
          playSound: true,
        });
        handleSaveSchedule(user.uid);
      }

      // Set a background timer to de-activate silent mode at the start time
      if (endDelay > 0) {
        BackgroundTimer.setTimeout(() => {
          handleDeactivateSilentMode();
        }, endDelay);
      }
      setActivationStateInStorage(true);
    }
  };

  const handleDeactivateSilentMode = async () => {
    setActivationLocked(false);
    setIsSchedulerEnabled(false);
    await VolumeManager.setVolume(1, {
      type: 'ring',
      showUI: true,
      playSound: true,
    });
    await VolumeManager.setVolume(1, {
      type: 'notification',
      showUI: true,
      playSound: true,
    });
    await VolumeManager.setVolume(1, {
      type: 'music',
      showUI: true,
      playSound: true,
    });
    setActivationStateInStorage(false);
    Alert.alert('Silent Deactivated', 'Silent mode has been deactivated');
  };

  const setActivationStateInStorage = async (state: boolean) => {
    try {
      await AsyncStorage.setItem('activationLocked', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save activation state', error);
    }
  };

  const handleSaveSchedule = async (uid: any) => {
    try {
      // Check for duplicates before saving
      const snapshot = await firestore()
        .collection('schedules')
        .where('startTime', '==', startTime)
        .where('endTime', '==', endTime)
        .get();

      if (!snapshot.empty) {
        Alert.alert('Duplicate schedule', 'This schedule already exists.');
        return;
      }

      await firestore().collection('schedules').add({
        startTime,
        endTime,
        date: new Date(),
        userId: uid,
      });
      Alert.alert('Schedule saved', 'Your schedule has been saved');
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Failed to save schedule');
    }
  };

  const handleLogout = async () => {
    try {
      const currentUser = await auth().currentUser;
      if (currentUser) {
        // If the user is signed in, proceed with logout
        await GoogleSignin.signOut();
        await auth().signOut();
      } else setUser(false);
    } catch (error) {
      console.error(error);
    } finally {
      setUser(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Volume Scheduler</Text>
      <View style={styles.row}>
        <Text>Enable Scheduler</Text>
        <Switch
          onValueChange={handleSchedulerToggle}
          value={isSchedulerEnabled}
        />
      </View>
      <TouchableOpacity
        onPress={() => setShowStartPicker(true)}
        style={styles.timeButton}>
        <Text>Start Time: {startTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {!activationLocked && showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          onChange={onStartChange}
          disabled={activationLocked}
        />
      )}
      <TouchableOpacity
        onPress={() => setShowEndPicker(true)}
        style={styles.timeButton}>
        <Text>End Time: {endTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {!activationLocked && showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          onChange={onEndChange}
          disabled={activationLocked}
        />
      )}
      <Button
        title="Activate Silent Mode"
        onPress={handleSilentModeToggle}
        disabled={!isSchedulerEnabled || activationLocked}
      />
      <View style={styles.line} />
      <Button
        title="Deactivate Silent Mode"
        onPress={handleDeactivateSilentMode}
      />
      <View style={styles.line} />
      <Button
        title="View Saved Schedules"
        onPress={() => navigation.navigate('Schedules')}
      />
      <View style={styles.line} />
      <Button title="Logout" onPress={handleLogout} color="red" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  line: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default ScheduleVolumeManager;
