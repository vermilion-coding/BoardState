import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Grid } from '@mui/material';
import axios from 'axios';
import './Home.css';

export default function Home() {
    const [randomCard, setRandomCard] = useState(null);
    const [randomCommander, setRandomCommander] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    //Ensures that cards are only rendered once when visiting the page
    useEffect(() => { 
        fetchRandomCard();
        fetchRandomCommander();
    }, []); 

    const fetchRandomCard = () => {
        // Fetch random card from Scryfall API
        setIsLoading(true);
        axios.get('https://api.scryfall.com/cards/random')
            .then(response => {
                const cardData = response.data;
                // Check if the card has multiple faces
                if (cardData.card_faces && cardData.card_faces.length > 0) {
                    // For dual-faced cards, set the random card data to the first face
                    setRandomCard(cardData.card_faces[0]);
                } else {
                    setRandomCard(cardData);
                }
            })
            .catch(error => {
                console.error('Error fetching random card:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const fetchRandomCommander = () => {
        // Fetch random commander card from Scryfall API
        axios.get('https://api.scryfall.com/cards/random?q=is%3Acommander')
            .then(response => {
                const commanderData = response.data;
                // Check if the card has multiple faces
                if (!commanderData.card_faces || commanderData.card_faces.length === 0) {
                    // For cards with one face, set the random commander data
                    setRandomCommander(commanderData);
                } else {
                    // For cards with multiple faces, fetch another random commander
                    fetchRandomCommander();
                }
            })
            .catch(error => {
                console.error('Error fetching random commander:', error);
            });
    };
    
    return (
        <Container maxWidth="lg">
            <Typography align='center' variant="h2" gutterBottom className="welcome">Welcome to BoardState!</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box className="random-card-box">
                        {isLoading && <Typography>Loading...</Typography>}
                        {randomCard && !isLoading && (
                            <>
                                <img className="card-image" src={randomCard.image_uris.art_crop} alt={randomCard.name} style={{ maxWidth: '100%' }} />
                                <Typography className="card-title" variant="h6" gutterBottom>Random Card Art: {randomCard.name}</Typography>
                            </>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box className="random-commander-box">
                        <Typography variant="h4" gutterBottom>Random Commander</Typography>
                        {randomCommander && (
                            <>
                                <img className="commander-image" src={randomCommander.image_uris.normal} alt={randomCommander.name} />
                            </>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );}
