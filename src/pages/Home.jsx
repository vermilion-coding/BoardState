import { useState } from "react"
import { SearchBar } from "../components/SearchBar"
import "./Home.css"
import { SearchResultsList } from "../components/SearchResultsList"

export default function Home() {

    const [results, setResults] = useState([])

    
    return(
        <div className="search-bar-container"> 
            <SearchBar setResults={setResults}/>
            <SearchResultsList results={results}/>
        </div>
    )
}