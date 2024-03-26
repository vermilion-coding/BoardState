import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';
import './Home.css';

export default function Home() {
    const [randomCard, setRandomCard] = useState(null);
    const [randomCommander, setRandomCommander] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        fetchRandomCard();
        fetchRandomCommander();
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures this effect runs only once on mount

    const fetchRandomCard = () => {
        // Fetch random card from Scryfall API
        setIsLoading(true);
        axios.get('https://api.scryfall.com/cards/random')
            .then(response => {
                const cardData = response.data;
                // Check if the card has multiple faces
                if (cardData.card_faces && cardData.card_faces.length > 0) {
                    // For dual-faced cards, set the random card data to the first face
                    setRandomCard(cardData.card_faces[0]); //DISPLAY BOTH
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
                if (commanderData.card_faces && commanderData.card_faces.length > 0) {
                    // For dual-faced cards, set the random commander data to the first face
                    setRandomCommander(commanderData.card_faces[0]);
                } else {
                    setRandomCommander(commanderData);
                }
            })
            .catch(error => {
                console.error('Error fetching random commander:', error);
            });
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h2" gutterBottom style={{ fontFamily: 'Arial', borderBottom: '2px solid #000', marginBottom: '20px' }}>Welcome to BoardState!</Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper', p: 3, borderRadius: 4, border: '2px solid #000', marginBottom: '20px' }}>
                        <Typography variant="h4" gutterBottom>Current Time and Date</Typography>
                        <Typography variant="h5" gutterBottom>{currentDateTime.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper', p: 3, borderRadius: 4, border: '2px solid #000', marginBottom: '20px' }}>
                        {isLoading && <Typography>Loading...</Typography>}
                        {randomCard && !isLoading && (
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>Random Card Art: {randomCard.name}</Typography>
                                    <img src={randomCard.image_uris.art_crop} alt={randomCard.name} style={{ maxWidth: '100%', height: 'auto' }} />
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper', p: 3, borderRadius: 4, border: '2px solid #000', marginBottom: '20px' }}>
                        <Typography variant="h4" gutterBottom>Random Commander</Typography>
                        {randomCommander && (
                            <Card>
                                <CardContent>
                                    <img src={randomCommander.image_uris.normal} alt={randomCommander.name} style={{ maxWidth: '100%', height: 'auto' }} />
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}
