import { useState } from 'react'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Decks from './pages/Decks'
import About from './pages/About'
import LoginPage from './pages/Login'
import {Route, Routes} from "react-router-dom"
import SignUpPage from './pages/Signup'
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


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

function App() {
  return (
    <>
      <NavBar/>
      <div className='container'>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/decks" element={<Decks/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignUpPage/>}/>
        </Routes>
      </div>
    </>
    )
  }
export default App
