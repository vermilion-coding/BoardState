import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from '@mui/material';
import axios from 'axios';

export default function Home() {
    const [trendingCards, setTrendingCards] = useState([]);
    const [recentArticles, setRecentArticles] = useState([]);

    useEffect(() => {
        fetchTrendingCards();
        fetchRecentArticles();
    }, []);

    const fetchTrendingCards = () => {
        // Fetch trending cards from TCGPlayer API
        // Example API endpoint: https://api.tcgplayer.com/trending_products
        // Replace the URL with the actual API endpoint
        axios.get('https://api.tcgplayer.com/trending_products')
            .then(response => {
                setTrendingCards(response.data);
            })
            .catch(error => {
                console.error('Error fetching trending cards:', error);
            });
    };

    const fetchRecentArticles = () => {
        // Fetch recent articles from EDHRec.com API
        // Example API endpoint: https://api.edhrec.com/articles/recent
        // Replace the URL with the actual API endpoint
        axios.get('https://api.edhrec.com/articles/recent')
            .then(response => {
                setRecentArticles(response.data);
            })
            .catch(error => {
                console.error('Error fetching recent articles:', error);
            });
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h2" gutterBottom style={{ fontFamily: 'Roboto Mono, monospace', borderBottom: '2px solid #000', marginBottom: '20px' }}>Home</Typography>
            
            {/* Trending Cards Section */}
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 4, border: '2px solid #000', marginBottom: '20px' }}>
                <Typography variant="h4" gutterBottom>Trending Cards on TCGPlayer</Typography>
                <Box>
                    {trendingCards.map(card => (
                        <Typography key={card.id} variant="body1">{card.name} - ${card.price}</Typography>
                    ))}
                </Box>
            </Box>

            {/* Recent Articles Section */}
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 4, border: '2px solid #000' }}>
                <Typography variant="h4" gutterBottom>Recent Articles from EDHRec.com</Typography>
                <Box>
                    {recentArticles.map(article => (
                        <Typography key={article.id} variant="body1">{article.title}</Typography>
                    ))}
                </Box>
            </Box>
        </Container>
    );
}

