import { useState } from "react"
import { SearchBar } from "../components/SearchBar"
import "./Home.css"
import { SearchResultsList } from "../components/SearchResultsList"
import {SearchCard} from "../components/SearchCard"

export default function Home() {

    const [results, setResults] = useState([])

    
    return(
        <div> <SearchCard/> </div>
    )
}