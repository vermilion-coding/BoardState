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
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() !== '') {
            setLoading(true);
            axios.get(`https://api.scryfall.com/cards/search?q=${searchQuery}&limit=10`)
                .then(response => {
                    setSearchResults(response.data.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching search results:', error);
                    setSearchResults([]);
                    setLoading(false);
                });
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const addCardToSelected = (card) => {
        const updatedCounts = { ...cardCounts };
        updatedCounts[card.id] = (updatedCounts[card.id] || 0) + 1;
        setCardCounts(updatedCounts);
        if (!selectedCards.some(selectedCard => selectedCard.id === card.id)) {
            setSelectedCards([...selectedCards, card]);
        }
    };

    const removeCardFromSelected = (cardId) => {
        const updatedSelectedCards = selectedCards.filter(card => card.id !== cardId);
        const updatedCounts = { ...cardCounts };
        delete updatedCounts[cardId];
        setCardCounts(updatedCounts);
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
        setIsEditing(true);
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

    const handleSearchResultClick = (card) => {
        setSelectedCard(card);
        setOpenDialog(true);
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Box border={1} borderRadius={4} p={2} style={{ height: '375px', maxHeight: '400px', overflowY: 'auto' }}>
                        <Typography variant="h4">Decks</Typography>
                        <Button variant="contained" onClick={createNewDeck}>New Deck</Button>
                        <Box mt={2} style={{ display: 'flex', flexDirection: 'column', maxHeight: '200px', overflowY: 'auto' }}>
                            {decks.map(deck => (
                                <div key={deck.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">{deck.name}</Typography>
                                    <div>
                                        <Button variant="contained" onClick={() => selectDeck(deck)}>Edit</Button>
                                        <Button variant="contained" onClick={() => deleteDeck(deck.id)}>Delete</Button>
                                        <Button variant="contained" onClick={() => renameDeck(deck.id)}>Rename</Button>
                                        <Button variant="contained" onClick={() => exportDeck(deck)}>Export Deck</Button>
                                    </div>
                                </div>
                            ))}
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box border={1} borderRadius={4} p={2} mt={0} ml={2}>
                        <Typography variant="h5">Selected Cards:</Typography>
                        <Box mt={1} style={{ height: '300px', maxHeight: '300px', overflowY: 'auto' }}>
                            {selectedCards.map((card, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }} onClick={() => handleCardClick(card)}>
                                    <Typography style={{ width: '80px' }}>{cardCounts[card.id] || 0}</Typography>
                                    <Typography>{card.name}</Typography>
                                    <Button variant="contained" size="small" style={{ width: '80px' }} onClick={() => {
                                        const updatedCounts = { ...cardCounts };
                                        updatedCounts[card.id] = (updatedCounts[card.id] || 0) + 1;
                                        setCardCounts(updatedCounts);
                                        saveDeck(currentDeck, selectedCards);
                                    }}>+</Button>
                                    <Button variant="contained" size="small" style={{ width: '80px' }} onClick={() => {
                                        const updatedCounts = { ...cardCounts };
                                        if (updatedCounts[card.id] > 0) {
                                            updatedCounts[card.id]--;
                                            setCardCounts(updatedCounts);
                                            if (updatedCounts[card.id] === 0) {
                                                removeCardFromSelected(card.id);
                                            }
                                        }
                                        saveDeck(currentDeck, selectedCards);
                                    }}>-</Button>
                                </div>
                            ))}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box border={1} borderRadius={4} p={2} mt={3}>
                {isEditing && (
                    <Typography variant="h4">Edit Deck: {currentDeck ? currentDeck.name : ''}</Typography>
                )}
                <TextField
                    type="text"
                    placeholder="Search for cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    fullWidth
                />
                <Box mt={2} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Typography variant="h5">Search Results:</Typography>
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        searchResults.map(card => (
                            <div key={card.id} style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography onClick={() => handleSearchResultClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                <Button variant="contained" size="small" style={{ width: '80px' }} onClick={() => addCardToSelected(card)}>Add</Button>
                            </div>
                        ))
                    )}
                </Box>
            </Box>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogContent style={{ display: 'flex' }}>
                    {selectedCard && selectedCard.card_faces ? (
                        selectedCard.card_faces.map((face, index) => (
                            <div key={index} style={{ marginRight: '10px' }}>
                                <img src={face.image_uris?.png} alt={face.name} style={{ maxWidth: '100%' }} />
                            </div>
                        ))
                    ) : (
                        <img src={selectedCard?.image_uris?.png} alt={selectedCard?.name} style={{ maxWidth: '100%' }} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
