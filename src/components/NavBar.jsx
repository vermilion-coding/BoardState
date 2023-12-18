import {Link, useMatch, useResolvedPath} from "react-router-dom"
import "./NavBar.css"

export default function NavBar() {
    const path = window.location.pathname

    return <nav className="nav">
        <Link to="/" className="site-title">BoardState</Link>
        <ul>
            <CustomLink to = "/decks">Decks</CustomLink>
            <CustomLink to = "/about">About</CustomLink>
        </ul>
    </nav>
}

function CustomLink({to, children, ...props}) {
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({path :resolvedPath.pathname, end: true})
    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>{children}</Link>
        </li>
    )
}