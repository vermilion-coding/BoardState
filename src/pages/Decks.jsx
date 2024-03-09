import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Box, TextField, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function Decks() {
    const [selectedCards, setSelectedCards] = useState([]);
    const [decks, setDecks] = useState([]);
    const [currentDeck, setCurrentDeck] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [cardCounts, setCardCounts] = useState({});

    useEffect(() => {
        if (searchQuery.trim() !== '') {
            axios.get(`https://api.scryfall.com/cards/search?q=${searchQuery}&limit=10`) // Limit search results to 10
                .then(response => {
                    setSearchResults(response.data.data);
                })
                .catch(error => {
                    console.error('Error fetching search results:', error);
                    setSearchResults([]);
                });
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const addCardToSelected = (card) => {
        const updatedCounts = { ...cardCounts };
        updatedCounts[card.id] = (updatedCounts[card.id] || 0) + 1;
        setCardCounts(updatedCounts);
        setSelectedCards([...selectedCards, card]);
    };

    const removeCardFromSelected = (index) => {
        const updatedSelectedCards = [...selectedCards];
        const cardId = updatedSelectedCards[index].id;
        const updatedCounts = { ...cardCounts };
        if (updatedCounts[cardId] > 1) {
            updatedCounts[cardId]--;
        } else {
            delete updatedCounts[cardId];
        }
        setCardCounts(updatedCounts);
        updatedSelectedCards.splice(index, 1);
        setSelectedCards(updatedSelectedCards);
    };

    const createNewDeck = () => {
        const newDeck = {
            id: Date.now(),
            name: `Deck ${decks.length + 1}`,
            cards: [],
        };
        setDecks([...decks, newDeck]);
    };

    const selectDeck = (deck) => {
        setCurrentDeck(deck);
        setSelectedCards(deck.cards);
    };

    const saveDeck = () => {
        if (currentDeck) {
            const updatedDecks = decks.map(deck =>
                deck.id === currentDeck.id ? { ...deck, cards: selectedCards } : deck
            );
            setDecks(updatedDecks);
        }
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Box border={1} borderRadius={4} p={2}>
                        <Typography variant="h4">Decks</Typography>
                        <Button variant="contained" onClick={createNewDeck}>New Deck</Button>
                        {decks.map(deck => (
                            <div key={deck.id}>
                                <Typography variant="h6">{deck.name}</Typography>
                                <Button variant="contained" onClick={() => selectDeck(deck)}>Edit</Button>
                            </div>
                        ))}
                    </Box>
                </Grid>
            </Grid>
            {currentDeck && (
                <Box border={1} borderRadius={4} p={2} mt={3}>
                    <Typography variant="h4">Edit Deck: {currentDeck.name}</Typography>
                    <TextField
                        type="text"
                        placeholder="Search for cards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="outlined"
                        fullWidth
                    />
                    <Box mt={2}>
                        <Typography variant="h5">Search Results:</Typography>
                        {searchResults.map(card => (
                            <div key={card.id}>
                                <Typography>{card.name}</Typography>
                                <Button variant="contained" onClick={() => addCardToSelected(card)}>Add</Button>
                                {cardCounts[card.id] ? <Typography>{cardCounts[card.id]}</Typography> : null}
                                {cardCounts[card.id] ? (
                                    <Button variant="contained" onClick={() => removeCardFromSelected(selectedCards.findIndex(c => c.id === card.id))}>Remove</Button>
                                ) : null}
                            </div>
                        ))}
                    </Box>
                    <Box mt={2}>
                        <Typography variant="h5">Selected Cards:</Typography>
                        {selectedCards.map((card, index) => (
                            <div key={index}>
                                <Typography>{card.name}</Typography>
                                <Typography>{cardCounts[card.id]}</Typography>
                                <Button variant="contained" onClick={() => removeCardFromSelected(index)}>Remove</Button>
                            </div>
                        ))}
                    </Box>
                    <Button variant="contained" onClick={saveDeck}>Save Deck</Button>
                </Box>
            )}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{selectedCard?.name}</DialogTitle>
                <DialogContent>
                    <img src={selectedCard?.image_uris?.normal} alt={selectedCard?.name} style={{ maxWidth: '100%' }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}