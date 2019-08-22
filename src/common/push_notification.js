import firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/firestore';

export const initializeFirebase = () => {
    firebase.initializeApp({
        apiKey: "AIzaSyCwbyI8f9wUMIXE34-MZRKM_O9xixMiJn8",
        authDomain: "quantadice-01.firebaseapp.com",
        projectId: "quantadice-01",
        messagingSenderId: "81485966475"
    });

    navigator.serviceWorker
    .register('/public/firebase-messaging-sw.js')
    .then((registration) => {
      firebase.messaging().useServiceWorker(registration);
    });
}

export const askForPermissionToReceiveNotifications = async (name) => {
    try {
        const messaging = firebase.messaging()
        var db = firebase.firestore()

        await Notification.requestPermission()
        const token = await messaging.getToken()
        console.log('token:', token)

        db.collection("notification_tokens").doc(name).set({
            token: token,
        })
        
        return token;
    } catch (error) {
        console.error(error);
    }
}