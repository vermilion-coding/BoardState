import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function About() {
    return (
        <Container maxWidth="md" style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
            <Typography variant="h2" gutterBottom style={{ fontFamily: 'Roboto Mono, monospace', borderBottom: '2px solid #000', marginBottom: '20px' }}>About BoardState</Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 4, border: '2px solid #000' }}>
                <Typography variant="body1" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.2rem' }}>
                    BoardState is a web application designed for creating Magic: the Gathering decks. It provides an intuitive interface for users to search for cards, add them to their decks, and manage their collections.
                </Typography>
                <Typography variant="body1" mt={2} style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.2rem' }}>
                    Features:
                    <ul>
                        <li>Search for Magic: the Gathering cards using the Scryfall API.</li>
                        <li>Create and manage multiple decks.</li>
                        <li>View card details and images.</li>
                        <li>Export decks in text format.</li>
                    </ul>
                </Typography>
                <Typography variant="body1" mt={2} style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.2rem' }}>
                    BoardState is built using ReactJS and utilizes Material UI for styling.
                </Typography>
            </Box>
        </Container>
    );
}
