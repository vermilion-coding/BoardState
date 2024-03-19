import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        BoardState
      </Link>
      <ul className="nav-links">
        <CustomLink to="/decks">Decks</CustomLink>
        <CustomLink to="/login">Log In</CustomLink>
        <CustomLink to="/signup">Sign Up</CustomLink>
        <CustomLink to="/about">About</CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children }) {
  return (
    <li>
      <NavLink
        to={to}
        className="nav-link"
        activeClassName="active"
        exact
      >
        {children}
      </NavLink>
    </li>
  );
}
