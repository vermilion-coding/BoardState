import React, { useState, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Decks from './pages/Decks';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import LifeCounter from './pages/LifeCounter';


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
const auth = getAuth(app);
const db = getFirestore(app);
document.title = "BoardState"

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <NavBar user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/lifecounter" element={<LifeCounter />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}