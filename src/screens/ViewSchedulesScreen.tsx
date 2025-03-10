import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ViewSchedulesScreen = ({navigation}: any) => {
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const user = auth().currentUser;
        if (!user) {
          Alert.alert('Error', 'User not found');
          return;
        }
        const snapshot = await firestore()
          .collection('schedules')
          .where('userId', '==', user.uid)
          .get();
        const fetchedSchedules: any = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort the schedules by startTime in descending order
        const sortedSchedules = fetchedSchedules.sort(
          (a: any, b: any) => b.startTime.seconds - a.startTime.seconds,
        );
        setSchedules(sortedSchedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        Alert.alert('Failed to fetch schedules');
      }
    };
    fetchSchedules();
  }, []);

  const renderItem = ({item}: any) => (
    <View style={styles.scheduleItem}>
      <Text>
        Start Time:{' '}
        {new Date(item.startTime.seconds * 1000).toLocaleTimeString()}
      </Text>
      <Text>
        End Time: {new Date(item.endTime.seconds * 1000).toLocaleTimeString()}
      </Text>
      <Text>
        Scheduled Date: {item.startTime.toDate().toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backArrow}>{`<`}</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Saved Schedules</Text>
      </View>
      <FlatList
        data={schedules}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>No schedules found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
  },
  backArrow: {
    fontSize: 50,
    marginRight: 10,
    color: 'green',
    fontWeight: 'bold',
    lineHeight: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 24, // To balance the space with the back button
  },
  scheduleItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
});

export default ViewSchedulesScreen;
