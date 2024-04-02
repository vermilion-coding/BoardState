import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';
import './About.css';

export default function About() {
    return (
        <Container maxWidth="md" className="about-container">
            <Typography variant="h2" className="about-title">About BoardState</Typography>
            <Box className="about-content">
                <Typography variant="body1">
                    BoardState is a web application designed for creating Magic: the Gathering decks. It provides an intuitive interface for users to search for cards, add them to their decks, and manage their collections.
                </Typography>
                <Typography variant="body1" mt={2}>
                    Features:
                    <ul>
                        <li>Search for Magic: the Gathering cards using the <Link href="https://scryfall.com/docs/api" target="_blank" rel="noopener noreferrer">Scryfall API</Link>.</li>
                        <li>Create and manage multiple decks.</li>
                        <li>View card details and images.</li>
                        <li>Export decks in text format.</li>
                    </ul>
                </Typography>
                <Typography variant="body1" mt={2}>
                    BoardState is built using ReactJS and utilizes Material UI for styling.
                </Typography>
            </Box>
        </Container>
    );
}

