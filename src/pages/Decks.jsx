import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Box, TextField, Button, Typography, Dialog, DialogContent, DialogActions } from '@mui/material';
import { getFirestore, deleteDoc, doc, setDoc, updateDoc, collection, getDoc, addDoc, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { getAuth } from 'firebase/auth';

export default function Decks() {
    const [selectedCards, setSelectedCards] = useState([]);
    const [decks, setDecks] = useState([]);
    const [currentDeck, setCurrentDeck] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [deckCardCounts, setDeckCardCounts] = useState({});
    const [showDeck, setShowDeck] = useState(true);
    const [db, setDb] = useState(null); // Firestore instance

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        const initializeFirestore = async () => {
            const firestore = getFirestore();
            setDb(firestore);
        };

        if (user && !db) {
            initializeFirestore();
        }
    }, [db]);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        const fetchDecks = async () => {
            if (!user || !db) {
                return;
            }
        
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
        
            if (!userDocSnapshot.exists()) {
                return;
            }
        
            const userDecksRef = collection(userDocRef, 'decks');
            const userDecksSnapshot = await getDocs(userDecksRef);
        
            const userDecks = await Promise.all(userDecksSnapshot.docs.map(async doc => {
                const deckData = doc.data();
        
                // Query the cards collection for each deck
                const cardsSnapshot = await getDocs(collection(userDecksRef, doc.id, 'cards'));
                const cards = cardsSnapshot.docs.map(cardDoc => cardDoc.data());
        
                return {
                    id: doc.id,
                    ...deckData,
                    cards: cards // Include the fetched cards in the deck object
                };
            }));
        
            setDecks(userDecks);
        };
        
        fetchDecks();
    }, [db]);

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
        document.title = currentDeck ? `Deck: ${currentDeck.name}` : 'BoardState';
    }, [currentDeck]);


    const selectDeck = async (deckId) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error('User not logged in');
            return;
        }
    
        try {
            const db = getFirestore();
            if (!db) {
                console.error('Firestore instance not available');
                return;
            }
    
            const userDocRef = doc(db, 'users', user.uid);
            console.log('User document reference:', userDocRef.path);
            
            const decksCollectionRef = collection(userDocRef, 'decks');
            console.log('Decks collection reference:', decksCollectionRef.path);
            
            const deckRef = doc(decksCollectionRef, deckId);
            console.log('Deck document reference:', deckRef.path);
            
    
            if (!deckDoc.exists()) {
                console.error('Deck not found');
                return;
            }
    
            const cardsCollectionRef = collection(deckRef, 'cards');
            const cardsSnapshot = await getDocs(cardsCollectionRef);
    
            const selectedCards = cardsSnapshot.docs.map(cardDoc => {
                const cardData = cardDoc.data();
                return {
                    id: cardDoc.id,
                    name: cardData.name,
                    counters: cardData.counters,
                };
            });
            
            // Update the state with the selected cards
            setSelectedCards(selectedCards);
        } catch (error) {
            console.error('Error getting selected cards:', error);
        }
    };
    
    
    

    const addCardToSelected = async (card) => {
        let newSelectedCards;
        if (!deckCardCounts[currentDeck.id] || !deckCardCounts[currentDeck.id][card.id]) {
            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: {
                    ...deckCardCounts[currentDeck.id],
                    [card.id]: 1
                }
            });
            newSelectedCards = [...selectedCards, { ...card, counters: 1 }];
        } else {
            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: {
                    ...deckCardCounts[currentDeck.id],
                    [card.id]: deckCardCounts[currentDeck.id][card.id] + 1
                }
            });
            newSelectedCards = selectedCards.map(selectedCard =>
                selectedCard.id === card.id
                    ? { ...selectedCard, counters: selectedCard.counters + 1 }
                    : selectedCard
            );
        }

        setSelectedCards(newSelectedCards);

        // Update the deck's document in Firestore
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const deckRef = doc(collection(userDocRef, 'decks'), currentDeck.id);
            await updateDoc(deckRef, {
                cards: newSelectedCards.map(card => ({
                    id: card.id,
                    name: card.name,
                    counters: card.counters,
                })),
            });
        }
    };

    const removeCardFromSelected = async (cardId) => {
        const updatedCounts = { ...deckCardCounts[currentDeck.id] };
        if (updatedCounts[cardId] > 1) {
            updatedCounts[cardId]--;
            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: updatedCounts
            });

            // Update the card count in Firestore
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const db = getFirestore();
                const userDocRef = doc(db, 'users', user.uid);
                const deckRef = doc(collection(userDocRef, 'decks'), currentDeck.id);
                await updateDoc(deckRef, {
                    cards: selectedCards.map(card => ({
                        id: card.id,
                        name: card.name,
                        counters: updatedCounts[card.id] || 0
                    })),
                });
            }
        } else {
            delete updatedCounts[cardId];

            // Update the card count in Firestore
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const db = getFirestore();
                const userDocRef = doc(db, 'users', user.uid);
                const deckRef = doc(collection(userDocRef, 'decks'), currentDeck.id);
                await updateDoc(deckRef, {
                    cards: selectedCards.filter(card => card.id !== cardId).map(card => ({
                        id: card.id,
                        name: card.name,
                        counters: updatedCounts[card.id] || 0
                    })),
                });
            }

            setDeckCardCounts({
                ...deckCardCounts,
                [currentDeck.id]: updatedCounts
            });
            const updatedSelectedCards = selectedCards.filter(card => card.id !== cardId);
            setSelectedCards(updatedSelectedCards);
            saveDeck(currentDeck, updatedSelectedCards);
        }
    };

    const createNewDeck = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (!user) {
            // User not logged in, handle this case accordingly
            return;
        }
    
        const db = getFirestore(); // Assuming Firestore instance is initialized somewhere
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
    
        if (!userDocSnapshot.exists()) {
            // User document does not exist, handle this case accordingly
            return;
        }
    
        const newDeckRef = await addDoc(collection(userDocRef, 'decks'), {
            name: `Deck ${decks.length + 1}`,
        });
    
        // Create a subcollection for cards for the new deck
        const cardsCollectionRef = collection(newDeckRef, 'cards');
        const cardData = {
            id: 'f2dd95a1-98d5-4a5f-910d-12681750e4cf', // Aetherflux Reservoir card ID
            name: 'Aetherflux Reservoir',
            counters: 1,
        };
        await addDoc(cardsCollectionRef, cardData);
    
        const newDeck = {
            id: newDeckRef.id,
            name: `Deck ${decks.length + 1}`,
            cards: cardsCollectionRef,
        };
    
        const updatedDecks = [...decks, newDeck];
        setDecks(updatedDecks);
        setCurrentDeck(newDeck);
        setSelectedCards([cardData]);
    };
    


    const saveDeck = (deck, cards) => {
        // Update the 'decks' collection in Firestore
        const deckRef = doc(db, 'decks', deck.id.toString());
        setDoc(deckRef, {
            name: deck.name,
            cards: cards.map(card => ({ id: card.id, name: card.name })),
        });
    
        // Save the deck locally
        localDeck = { id: deck.id, name: deck.name, cards };
    };
    
    

    const deleteDeck = async (deckId) => {
        const updatedDecks = decks.filter(deck => deck.id !== deckId);
        setDecks(updatedDecks);
        setCurrentDeck(null);
        setSelectedCards([]);
    
        // Delete the deck document in Firestore
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const deckRef = doc(collection(userDocRef, 'decks'), deckId);
            await deleteDoc(deckRef);
        }
    };
    

    const renameDeck = async (deckId) => {
        const newName = prompt("Enter a new name for the deck:", decks.find(deck => deck.id === deckId).name);
        if (newName !== null) {
            const updatedDecks = decks.map(deck =>
                deck.id === deckId ? { ...deck, name: newName } : deck
            );
            setDecks(updatedDecks);
            if (currentDeck && currentDeck.id === deckId) {
                setCurrentDeck({ ...currentDeck, name: newName });
            }
    
            // Update the deck's name in Firestore
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const db = getFirestore();
                const userDocRef = doc(db, 'users', user.uid);
                const deckRef = doc(collection(userDocRef, 'decks'), deckId);
                await updateDoc(deckRef, { name: newName });
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

    const handleBackButtonClick = () => {
        setShowDeck(true);
        setCurrentDeck(null);
        setSelectedCards([]);
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                {showDeck ? (
                    <Grid item xs={12}>
                        <Box border={1} borderRadius={4} p={2} style={{ height: '800px', maxHeight: '800px', overflowY: 'auto' }}>
                            <Typography align="center" variant="h4">Decks</Typography>
                            <Button variant="contained" onClick={createNewDeck} fullWidth style={{ margin: '1rem 0' }}>New Deck</Button>
                            <Grid container spacing={2}>
                                {decks.sort((a, b) => a.id - b.id).map(deck => (
                                    <Grid key={deck.id} item xs={12} sm={4}>
                                        <Box border={1} borderRadius={4} p={2} bgcolor="background.paper">
                                            <Typography variant="h6">{deck.name}</Typography>
                                            <Box mt={2} display="flex" justifyContent="space-around">
                                                <Button variant="contained" onClick={() => selectDeck(deck)}>Edit</Button>
                                                <Button variant="contained" onClick={() => deleteDeck(deck.id)}>Delete</Button>
                                                <Button variant="contained" onClick={() => renameDeck(deck.id)}>Rename</Button>
                                                <Button variant="contained" onClick={() => exportDeck(deck)}>Export</Button>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                ) : (
                    <Grid item xs={12} sm={12}>
                        <Box border={1} borderRadius={4} p={2} display="flex" alignItems="center">
                            <Button variant="contained" onClick={handleBackButtonClick}>Back</Button>
                            <Typography variant="h4" style={{ marginLeft: 'auto' }}>{currentDeck.name}</Typography>
                        </Box>
                    </Grid>
                )}
                {!showDeck && (
                    <>
                        <Grid item xs={12} sm={5}>
                            <Box border={1} borderRadius={4} p={2} mt={0} ml={2}>
                                <Typography variant="h5">Selected Cards</Typography>
                                <Box mt={1} style={{ height: '630px', maxHeight: '630px', overflowY: 'auto' }}>
                                    {selectedCards.map((card, index) => (
                                        <Box key={index} display="flex" alignItems="center" justifyContent="space-between" my={1} p={1} border={1} borderRadius={4}>
                                            <Typography>{deckCardCounts[currentDeck.id][card.id] || 0}x</Typography>
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" onClick={() => addCardToSelected(card)}>+</Button>
                                                <Button variant="contained" size="small" onClick={() => removeCardFromSelected(card.id)}>-</Button>
                                            </div>
                                        </Box>
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
                                <Box mt={2} style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    <Typography variant="h5">Search Results</Typography>
                                    {searchResults.map(card => (
                                        <Box key={card.id} display="flex" alignItems="center" justifyContent="space-between" my={1} p={1} border={1} borderRadius={4} onClick={(e) => { if (!e.target.closest('button')) handleCardNameClick(card) }}>
                                            <Typography>{card.name}</Typography>
                                            <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); addCardToSelected(card) }}>Add</Button>
                                        </Box>
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
                                        <img src={face.image_uris.normal} alt={face.name} style={{ maxWidth: '100%', marginBottom: '10px' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {selectedCard?.image_uris?.normal && (
                                <img src={selectedCard.image_uris.normal} alt={selectedCard.name} style={{ maxWidth: '100%', marginBottom: '10px' }} />
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