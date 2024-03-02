import React, {useState} from "react";
import {FaSearch} from "react-icons/fa"
import "./SearchBar.css"


export const SearchBar = ({setResults}) => {
    const [input, setInput] = useState("")

    const fetchData = (value) => {
        fetch(`https://api.scryfall.com/cards/search?q=name`)
        .then((response) => response.json())
        .then(json => {
            const results = json.filter((cards) => {
                return (
                    value && 
                    cards && 
                    cards.name && 
                    cards.name.toLowerCase().includes(value)
                )
            })
            setResults(results)
        })
    }

    const handleChange = (value) => {
        setInput(value)
        fetchData(value)
    }

    return (
        <div className="input-wrapper">
            <FaSearch id="search-icon"/>
            <input placeholder="Search card name..." 
            value={input} 
            onChange={(e) => handleChange(e.target.value)}/>
        </div>
    )
}