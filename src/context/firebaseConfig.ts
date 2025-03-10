// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {getAnalytics} from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCrJX17osOUXMe9Nvnn8wyfMNaReT_qf4w',
  authDomain: 'schedule-time-2828b.firebaseapp.com',
  projectId: 'schedule-time-2828b',
  storageBucket: 'schedule-time-2828b.firebasestorage.app',
  messagingSenderId: '163246190332',
  appId: '1:163246190332:web:90adb1fc962edd0817b179',
  measurementId: 'G-5QJYS198D3',
};

// Initialize Firebase
export const app: any = initializeApp(firebaseConfig);
export const analytics: any = getAnalytics(app);

export default {app, analytics};
