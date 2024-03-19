// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAX2r7IuECjE2NFcqltnJYTXjJxkgm9HDA",
  authDomain: "boardstate-auth.firebaseapp.com",
  projectId: "boardstate-auth",
  storageBucket: "boardstate-auth.appspot.com",
  messagingSenderId: "528443621025",
  appId: "1:528443621025:web:bffe7a0ca8daae7b197ae0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

