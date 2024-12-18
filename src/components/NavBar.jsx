import React from "react";
import { Link, NavLink } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./NavBar.css";
import { useNavigate } from 'react-router-dom';

export default function NavBar({ user }) {
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful");
        navigate('/');
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });

  };

  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        <img src="src/assets/boardstate-logo.png" alt="BoardState Logo" style={{width:'120px', height:'120px'}}/>
      </Link>
      <ul className="nav-links">
        {user ? (
          <>
            <li className="nav-item">Logged in as: {user.email}</li>
            <li className="nav-item" onClick={handleSignOut}>
              Log Out
            </li>
            <CustomLink to="/decks">Decks</CustomLink>
            <CustomLink to="/lifecounter">Life Counter</CustomLink>
          </>
        ) : (
          <>
            <CustomLink to="/login">Log In</CustomLink>
            <CustomLink to="/signup">Sign Up</CustomLink>
          </>
        )}
        <CustomLink to="/about">About</CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children }) {
  return (
    <li>
      <NavLink to={to} className="nav-item">
        {children}
      </NavLink>
    </li>
  );
}
