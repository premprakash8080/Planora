export const environment = {
  production: true,
  apiBaseUrl: 'https://api.planora.com', // Production API base URL - Update this with your production URL
  firebase: {
    projectId: 'planora-9b2ef',
    apiKey: 'AIzaSyCArEkC1Ykn975QZ1RXf_2WBvDg7KHMmGw',
    authDomain: 'planora-9b2ef.firebaseapp.com',
    databaseURL: 'https://planora-9b2ef-default-rtdb.firebaseio.com',
    storageBucket: 'planora-9b2ef.appspot.com',
    messagingSenderId: '105725094892489987825',
    // IMPORTANT: Get the actual App ID from Firebase Console > Project Settings > Your apps > Web app
    // The format should be: 1:105725094892489987825:web:xxxxxxxxxxxxx
    appId: '1:105725094892489987825:web:dummyAppId' // TODO: Replace with actual app ID from Firebase Console
  }
};
