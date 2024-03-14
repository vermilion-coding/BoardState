import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Box, TextField, Button, Typography, Dialog, DialogContent, DialogActions } from '@mui/material';

export default function Decks() {
    const [selectedCards, setSelectedCards] = useState([]);
    const [decks, setDecks] = useState([]);
    const [currentDeck, setCurrentDeck] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [deckCardCounts, setDeckCardCounts] = useState({});

    useEffect(() => {
        if (searchQuery.trim() !== '') {
            axios.get(`https://api.scryfall.com/cards/search?q=${searchQuery}&limit=10&order=name`)
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

    useEffect(() => {
        document.title = currentDeck ? `Selected Cards - ${currentDeck.name}` : 'Selected Cards';
    }, [currentDeck]);

    const addCardToSelected = (card) => {
        if (!deckCardCounts[currentDeck.id]) {
            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: { [card.id]: 1 }
            });
        } else if (!deckCardCounts[currentDeck.id][card.id]) {
            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: {
                    ...deckCardCounts[currentDeck.id],
                    [card.id]: 1
                }
            });
        } else {
            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: {
                    ...deckCardCounts[currentDeck.id],
                    [card.id]: deckCardCounts[currentDeck.id][card.id] + 1
                }
            });
        }

        if (!selectedCards.some(selectedCard => selectedCard.id === card.id)) {
            const newSelectedCards = [...selectedCards, card];
            setSelectedCards(newSelectedCards);
            saveDeck(currentDeck, newSelectedCards);
        }
    };

    const removeCardFromSelected = (cardId) => {
        const updatedCounts = { ...deckCardCounts[currentDeck.id] };
        if (updatedCounts[cardId] > 1) {
            updatedCounts[cardId]--;
            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: updatedCounts
            });
        } else {
            delete updatedCounts[cardId];
            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: updatedCounts
            });
            const updatedSelectedCards = selectedCards.filter(card => card.id !== cardId);
            setSelectedCards(updatedSelectedCards);
            saveDeck(currentDeck, updatedSelectedCards);
        }
    };

    const createNewDeck = () => {
        const newDeck = {
            id: Date.now(),
            name: `Deck ${decks.length + 1}`,
            cards: [],
        };
        const updatedDecks = [...decks, newDeck];
        setDecks(updatedDecks);
        setCurrentDeck(newDeck);
        setSelectedCards([]);
    };

    const selectDeck = (deck) => {
        setCurrentDeck(deck);
        setSelectedCards(deck.cards);
    };

    const saveDeck = (deck, cards) => {
        const updatedDecks = decks.map(d =>
            d.id === deck.id ? { ...d, cards: cards } : d
        );
        setDecks(updatedDecks);
    };

    const deleteDeck = (deckId) => {
        const updatedDecks = decks.filter(deck => deck.id !== deckId);
        setDecks(updatedDecks);
        setCurrentDeck(null);
        setSelectedCards([]);
    };

    const renameDeck = (deckId) => {
        const newName = prompt("Enter a new name for the deck:", decks.find(deck => deck.id === deckId).name);
        if (newName !== null) {
            const updatedDecks = decks.map(deck =>
                deck.id === deckId ? { ...deck, name: newName } : deck
            );
            setDecks(updatedDecks);
            if (currentDeck && currentDeck.id === deckId) {
                setCurrentDeck({ ...currentDeck, name: newName });
            }
        }
    };

    const handleCardNameClick = (card) => {
        setSelectedCard(card);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const exportDeck = (deck) => {
        const deckList = deck.cards.map(card => `${deckCardCounts[deck.id][card.id] || 1}x ${card.name}`).join('\n');
        const blob = new Blob([deckList], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deck.name}_Decklist.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid item xs={12} sm={currentDeck ? 6 : 12}>
                    <Box border={1} borderRadius={4} p={2} style={{ height: '375px', maxHeight: '400px', overflowY: 'auto' }}>
                        <Typography variant="h4">Decks</Typography>
                        <Button variant="contained" onClick={createNewDeck}>New Deck</Button>
                        <Box mt={2} style={{ display: 'flex', flexDirection: 'column', maxHeight: '240px', overflowY: 'auto' }}>
                            {decks.map(deck => (
                                <div key={deck.id} style={{ border: '1px solid black', borderRadius: '4px', padding: '8px', marginBottom: '8px' }}>
                                    <Typography variant="h6">{deck.name}</Typography>
                                    <div>
                                        <Button variant="contained" onClick={() => selectDeck(deck)} style={{ width: '80px', height: '50px' }}>Edit</Button>
                                        <Button variant="contained" onClick={() => deleteDeck(deck.id)} style={{ width: '80px', height: '50px' }}>Delete</Button>
                                        <Button variant="contained" onClick={() => renameDeck(deck.id)} style={{ width: '80px', height: '50px' }}>Rename</Button>
                                        <Button variant="contained" onClick={() => exportDeck(deck)} style={{ width: '80px', height: '50px' }}>Export</Button>
                                    </div>
                                </div>
                            ))}
                        </Box>
                    </Box>
                </Grid>
                {currentDeck && (
                <>
                <Grid item xs={12} sm={6}>
                    <Box border={1} borderRadius={4} p={2} mt={0} ml={2}>
                        <Typography variant="h5">{`Selected Cards - ${currentDeck.name}`}</Typography>
                        <Box mt={1} style={{ height: '300px', maxHeight: '300px', overflowY: 'auto' }}>
                            {selectedCards.map((card, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                    <Typography style={{ width: '80px' }}>{deckCardCounts[currentDeck.id][card.id] || 0}</Typography>
                                    <Typography onClick={() => handleCardNameClick(card)}>{card.name}</Typography>
                                    <Button variant="contained" size="small" onClick={() => addCardToSelected(card)} style={{ width: '80px', height: '50px' }}>+</Button>
                                    <Button variant="contained" size="small" onClick={() => removeCardFromSelected(card.id)} style={{ width: '80px', height: '50px' }}>-</Button>
                                </div>
                            ))}
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box border={1} borderRadius={4} p={2} mt={0} ml={2}>
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
                            {searchResults.map(card => (
                                <div key={card.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                    <Typography onClick={() => handleCardNameClick(card)}>{card.name}</Typography>
                                    <Button maxWidth='80px' variant="contained" size="small" onClick={() => addCardToSelected(card)} style={{ width: '160px', height: '50px' }}>Add</Button>
                                </div>
                            ))}
                        </Box>
                    </Box>
                </Grid>
                </>
                )}
            </Grid>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogContent>
                    {selectedCard?.card_faces && selectedCard.card_faces.length > 1 ? (
                        <div style={{ display: 'flex' }}>
                            {selectedCard.card_faces.map((face, index) => (
                                <div key={index} style={{ marginRight: '10px' }}>
                                    {face.image_uris?.normal && (
                                        <img src={face.image_uris?.normal} alt={face.name} style={{ maxWidth: '100%', marginBottom: '10px' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {selectedCard?.image_uris?.normal && (
                                <img src={selectedCard?.image_uris?.normal} alt={selectedCard?.name} style={{ maxWidth: '100%', marginBottom: '10px' }} />
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
