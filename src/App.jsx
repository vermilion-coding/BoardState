import { useState } from 'react'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Decks from './pages/Decks'
import About from './pages/About'
import LoginPage from './pages/Login'
import {Route, Routes} from "react-router-dom"

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
        </Routes>
      </div>
    </>
    )
  }
export default App
