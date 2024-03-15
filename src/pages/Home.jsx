import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import axios from 'axios';

export default function Home() {
    const [randomCard, setRandomCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRandomCard();
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

    return (
        <Container maxWidth="lg">
            <Typography variant="h2" gutterBottom style={{ fontFamily: 'Arial', borderBottom: '2px solid #000', marginBottom: '20px' }}>Home</Typography>
            
            {/* Random Card Section */}
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 4, border: '2px solid #000', marginBottom: '20px' }}>
                <Typography variant="h4" gutterBottom>Welcome to BoardState!</Typography>
                {isLoading && <Typography>Loading...</Typography>}
                {randomCard && !isLoading && (
                    <Card>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Random Card Art: {randomCard.name}</Typography>
                            <img src={randomCard.image_uris.art_crop} alt={randomCard.name} style={{ maxWidth: '70%' }} />
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Container>
    );
}
