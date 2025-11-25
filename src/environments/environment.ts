// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:2019', // Backend API base URL
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
