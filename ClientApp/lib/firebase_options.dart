import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBRrE-sUvcblUvDUAxAxM4KxUfzhl-TIi8',
    appId: '1:396416197162:web:78bdfa96b9637342ad5953',
    messagingSenderId: '396416197162',
    projectId: 'yeloline-project',
    authDomain: 'yeloline-project.firebaseapp.com',
    storageBucket: 'yeloline-project.firebasestorage.app',
    databaseURL: 'https://yeloline-project-default-rtdb.firebaseio.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBRrE-sUvcblUvDUAxAxM4KxUfzhl-TIi8',
    appId: '1:396416197162:android:78bdfa96b9637342ad5953',
    messagingSenderId: '396416197162',
    projectId: 'yeloline-project',
    storageBucket: 'yeloline-project.firebasestorage.app',
    databaseURL: 'https://yeloline-project-default-rtdb.firebaseio.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBRrE-sUvcblUvDUAxAxM4KxUfzhl-TIi8',
    appId: '1:396416197162:ios:78bdfa96b9637342ad5953',
    messagingSenderId: '396416197162',
    projectId: 'yeloline-project',
    storageBucket: 'yeloline-project.firebasestorage.app',
    databaseURL: 'https://yeloline-project-default-rtdb.firebaseio.com',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyBRrE-sUvcblUvDUAxAxM4KxUfzhl-TIi8',
    appId: '1:396416197162:ios:78bdfa96b9637342ad5953',
    messagingSenderId: '396416197162',
    projectId: 'yeloline-project',
    storageBucket: 'yeloline-project.firebasestorage.app',
    databaseURL: 'https://yeloline-project-default-rtdb.firebaseio.com',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyBRrE-sUvcblUvDUAxAxM4KxUfzhl-TIi8',
    appId: '1:396416197162:web:78bdfa96b9637342ad5953',
    messagingSenderId: '396416197162',
    projectId: 'yeloline-project',
    authDomain: 'yeloline-project.firebaseapp.com',
    storageBucket: 'yeloline-project.firebasestorage.app',
    databaseURL: 'https://yeloline-project-default-rtdb.firebaseio.com',
  );
}
