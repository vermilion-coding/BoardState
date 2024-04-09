import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Box, TextField, Button, Typography, Dialog, DialogContent, DialogActions } from '@mui/material';
import { getFirestore, deleteDoc, doc, setDoc, updateDoc, collection, getDoc, addDoc, getDocs, onSnapshot } from 'firebase/firestore'; // Import Firestore functions
import { getAuth } from 'firebase/auth';
import './Decks.css';

export default function Decks() {
    const [selectedCards, setSelectedCards] = useState([]);
    const [decks, setDecks] = useState([]);
    const [currentDeck, setCurrentDeck] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
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
    
        // Clean up the effect to avoid re-initializing Firestore unnecessarily
        return () => {
            // Do nothing
        };
    }, []);

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

    const selectDeck = async (deckId) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error('User not logged in');
            return;
        }
    
        try {
            if (!db) {
                console.error('Firestore instance not available');
                return;
            }
    
            const userDocRef = doc(db, 'users', user.uid);
            const deckDocRef = doc(userDocRef, 'decks', deckId);
    
            const deckSnapshot = await getDoc(deckDocRef);
            if (!deckSnapshot.exists()) {
                console.error('Deck not found');
                return;
            }
    
            setCurrentDeck({ id: deckSnapshot.id, ...deckSnapshot.data() });
    
            const cardsCollectionRef = collection(userDocRef, 'decks', deckId, 'cards');
            const unsubscribe = onSnapshot(cardsCollectionRef, (snapshot) => {
                const selectedCards = snapshot.docs.map(cardDoc => {
                    const cardData = cardDoc.data();
                    return {
                        id: cardDoc.id,
                        name: cardData.name,
                        counters: cardData.counters,
                        type_line: cardData.type_line
                    };
                });
                setSelectedCards(selectedCards);
            });
    
            setShowDeck(false);
    
            return () => unsubscribe();
        } catch (error) {
            console.error('Error selecting deck:', error);
        }
    };

    const addCardToSelected = async (card) => {
        try {
            const db = getFirestore();
            const user = getAuth().currentUser;
            if (!db || !user) {
                console.error('Firestore instance not available or user not logged in');
                return;
            }
    
            const userDocRef = doc(db, 'users', user.uid);
            const deckRef = doc(collection(userDocRef, 'decks'), currentDeck.id);
    
            const selectedCardsRef = collection(deckRef, 'cards');
            const cardDocRef = doc(selectedCardsRef, card.id);
    
            const cardDocSnapshot = await getDoc(cardDocRef);
            if (!cardDocSnapshot.exists()) {
                // Card doesn't exist in the deck, create a new instance
                const cardData = {
                    name: card.name,
                    counters: 1,
                    cmc: card.cmc,
                    color_identity: card.color_identity,
                    type_line: card.type_line
                };

                // Check if the card has multiple faces
                if (card.card_faces && card.card_faces.length > 1) {
                    cardData.image_uris = card.card_faces.map(face => ({ normal: face.image_uris.normal }));
                } else {
                    cardData.image_uris = { normal: card.image_uris.normal };
                }

    
                // Check if the 'cards' subcollection exists and create the card document
                const selectedCardsCollection = await getDocs(selectedCardsRef);
                if (selectedCardsCollection.empty) {
                    await setDoc(deckRef, { name: currentDeck.name || 'Untitled Deck', cards: [] }); // Create the 'cards' subcollection if it doesn't exist
                }
    
                await setDoc(cardDocRef, cardData); // Add the card to the 'cards' subcollection
            } else {
                // Card already exists in the deck, update the counters
                await updateDoc(cardDocRef, {
                    counters: cardDocSnapshot.data().counters + 1
                });
            }
    
            // Update selectedCards state only if the card was added
            if (!cardDocSnapshot.exists()) {
                const updatedSelectedCards = [...selectedCards, { ...card, counters: 1 }];
                setSelectedCards(updatedSelectedCards);
            }
    
        } catch (error) {
            console.error('Error adding card to selected:', error);
        }
    };
    
    const removeCardFromSelected = async (cardId) => {
        try {
            const db = getFirestore();
            const user = getAuth().currentUser;
            if (!db || !user) {
                console.error('Firestore instance not available or user not logged in');
                return;
            }
    
            const userDocRef = doc(db, 'users', user.uid);
            const deckRef = doc(collection(userDocRef, 'decks'), currentDeck.id);
    
            const selectedCardsRef = collection(deckRef, 'cards');
            const cardDoc = doc(selectedCardsRef, cardId);
    
            const cardDocSnapshot = await getDoc(cardDoc);
            if (cardDocSnapshot.exists()) {
                const currentCount = cardDocSnapshot.data().counters;
                if (currentCount > 1) {
                    await updateDoc(cardDoc, {
                        counters: currentCount - 1
                    });
                } else {
                    await deleteDoc(cardDoc);
                }
            }

        } catch (error) {
            console.error('Error removing card from selected:', error);
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
            name: `Untitled Deck`,
        });

        const newDeck = {
            id: newDeckRef.id,
            name: `Untitled Deck`,
        };
    
        const updatedDecks = [...decks, newDeck];
        setDecks(updatedDecks);
        setCurrentDeck(newDeck);
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
    

    const renameDeck = async (deckId, db) => {
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

    const exportDeck = async (deckId) => {
        try {
            const db = getFirestore();
            const user = getAuth().currentUser;
            if (!db || !user) {
                console.error('Firestore instance not available or user not logged in');
                return;
            }
    
            const userDocRef = doc(db, 'users', user.uid);
            const deckRef = doc(collection(userDocRef, 'decks'), deckId);
            const deckDoc = await getDoc(deckRef);
    
            if (!deckDoc.exists()) {
                console.error('Deck not found');
                return;
            }
    
            const cardsCollectionRef = collection(deckRef, 'cards');
            const cardsSnapshot = await getDocs(cardsCollectionRef);
    
            const deckCardCounts = {};
            cardsSnapshot.forEach(cardDoc => {
                const cardData = cardDoc.data();
                deckCardCounts[cardDoc.id] = cardData.counters;
            });
    
            const deckList = await Promise.all(cardsSnapshot.docs.map(async cardDoc => {
                const cardData = cardDoc.data();
                const cardName = cardData.name;
                return `${deckCardCounts[cardDoc.id] || 1}x ${cardName}`;
            }));
    
            const blob = new Blob([deckList.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${deckDoc.data().name}_Decklist.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting deck:', error);
        }
    };

    const handleBackButtonClick = () => {
        setShowDeck(true);
        setCurrentDeck(null);
        setSelectedCards([]);
    };

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (!user || !db) {
            return;
        }
    
        const userDocRef = doc(db, 'users', user.uid);
    
        const fetchDecks = async () => {
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
    
        // Initial fetch of decks
        fetchDecks();
    
        // Listen for changes to the user document
        const unsubscribe = onSnapshot(userDocRef, () => {
            fetchDecks();
        });
    
        // Cleanup function
        return () => unsubscribe();
    }, [db]);
    

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                {showDeck ? (
                    <Grid item xs={12}>
                        <Box className="deck-container" p={2}>
                            <div className="welcome-section">
                                <Typography variant="h5" align="center" gutterBottom>Welcome to the Deck Builder!</Typography>
                                <Button className="new-deck-button" variant="contained" onClick={createNewDeck}>New Deck</Button>
                            </div>
                            <Grid container spacing={2}>
                                {decks.sort((a, b) => a.name - b.name).map(deck => (
                                    <Grid key={deck.id} item xs={12} sm={4}>
                                        <Box className="deck-box" p={2}>
                                            <div>
                                                <Typography variant="h4">{deck.name}</Typography>
                                            </div>
                                            <div className="deck-actions">
                                                <Button variant="contained" onClick={() => selectDeck(deck.id)}>Edit</Button>
                                                <Button variant="contained" onClick={() => deleteDeck(deck.id)}>Delete</Button>
                                                <Button variant="contained" onClick={() => renameDeck(deck.id, db)}>Rename</Button>
                                                <Button variant="contained" onClick={() => exportDeck(deck.id)}>Export</Button>
                                            </div>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                ) : (
                    <Grid item xs={12} sm={12}>
                        <Box className="current-deck-box" p={2} style={{ position: 'relative' }}>
                            <Button variant="contained" style={{ borderRadius: '10px', fontSize: "18px"}} onClick={handleBackButtonClick}>Back</Button>
                            <Box className="search-results-box" p={2} style={{position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', width: '50%', maxWidth: '500px', display: searchResults.length > 0 ? 'block' : 'none', backgroundColor: 'rgba(255, 255, 255)', borderRadius: '10px', padding: '10px', zIndex: 1}}>                                <Box className="search-results-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {searchResults.map(card => (
                                        <Box key={card.id} className="search-result-item" display="flex" alignItems="center" justifyContent="space-between" my={1} p={1} onClick={(e) => { if (!e.target.closest('button')) handleCardNameClick(card) }}>
                                            <Typography style={{color: 'black'}}>{card.name}</Typography>
                                            <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "14px"}} onClick={(e) => { e.stopPropagation(); addCardToSelected(card) }}>Add</Button>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                            <TextField
                                type="text"
                                placeholder="Search for cards..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    style: {
                                        color: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
                                        borderRadius: '2vw', // Use viewport width for border radius
                                        paddingLeft: '2vw',
                                        width: 'calc(100%'
                                    }
                                }}
                            />
                        </Box>
                    </Grid>
                )}
                <Grid item xs={12} sm={5} style={{display: !showDeck ? 'block' : 'none'}}>                    
                    <Box className="selected-cards-box" p={2} >
                        <Box className="selected-cards-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 2fr)', gap: '10px' }}>
                            {/* Column for Creature */}
                            <Box className="selected-card-column creature-column">
                                <Typography variant="h6" className="column-title">Creature</Typography>
                                <div className="column-content">
                                    {selectedCards.filter(card => card.type_line.includes("Creature")).map((card, index) => (
                                        <Box key={index} className="selected-card-item">
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => addCardToSelected(card)}>+</Button>
                                                <Typography className='counters'>{card.counters ? `${card.counters}x` : '0x'}</Typography>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => removeCardFromSelected(card.id)}>-</Button>
                                            </div>
                                        </Box>
                                    ))}
                                </div>
                            </Box>
                            {/* Column for Instant */}
                            <Box className="selected-card-column instant-column">
                                <Typography variant="h6" className="column-title">Instant</Typography>
                                <div className="column-content">
                                    {selectedCards.filter(card => card.type_line.includes("Instant")).map((card, index) => (
                                        <Box key={index} className="selected-card-item">
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => addCardToSelected(card)}>+</Button>
                                                <Typography className='counters'>{card.counters ? `${card.counters}x` : '0x'}</Typography>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => removeCardFromSelected(card.id)}>-</Button>
                                            </div>
                                        </Box>
                                    ))}
                                </div>
                            </Box>
                            {/* Column for Sorcery */}
                            <Box className="selected-card-column sorcery-column">
                                <Typography variant="h6" className="column-title">Sorcery</Typography>
                                <div className="column-content">
                                    {selectedCards.filter(card => card.type_line.includes("Sorcery")).map((card, index) => (
                                        <Box key={index} className="selected-card-item">
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => addCardToSelected(card)}>+</Button>
                                                <Typography className='counters'>{card.counters ? `${card.counters}x` : '0x'}</Typography>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => removeCardFromSelected(card.id)}>-</Button>
                                            </div>
                                        </Box>
                                    ))}
                                </div>
                            </Box>
                            {/* Column for Artifact */}
                            <Box className="selected-card-column artifact-column">
                                <Typography variant="h6" className="column-title">Artifact</Typography>
                                <div className="column-content">
                                    {selectedCards.filter(card => card.type_line.includes("Artifact")).map((card, index) => (
                                        <Box key={index} className="selected-card-item">
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => addCardToSelected(card)}>+</Button>
                                                <Typography className='counters'>{card.counters ? `${card.counters}x` : '0x'}</Typography>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => removeCardFromSelected(card.id)}>-</Button>
                                            </div>
                                        </Box>
                                    ))}
                                </div>
                            </Box>
                            {/* Column for Enchantment */}
                            <Box className="selected-card-column enchantment-column">
                                <Typography variant="h6" className="column-title">Enchantment</Typography>
                                <div className="column-content">
                                    {selectedCards.filter(card => card.type_line.includes("Enchantment")).map((card, index) => (
                                        <Box key={index} className="selected-card-item">
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => addCardToSelected(card)}>+</Button>
                                                <Typography className='counters'>{card.counters ? `${card.counters}x` : '0x'}</Typography>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => removeCardFromSelected(card.id)}>-</Button>
                                            </div>
                                        </Box>
                                    ))}
                                </div>
                            </Box>
                            {/* Column for Land */}
                            <Box className="selected-card-column land-column">
                                <Typography variant="h6" className="column-title">Land</Typography>
                                <div className="column-content">
                                    {selectedCards.filter(card => card.type_line.includes("Land")).map((card, index) => (
                                        <Box key={index} className="selected-card-item">
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => addCardToSelected(card)}>+</Button>
                                                <Typography className='counters'>{card.counters ? `${card.counters}x` : '0x'}</Typography>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => removeCardFromSelected(card.id)}>-</Button>
                                            </div>
                                        </Box>
                                    ))}
                                </div>
                            </Box>
                            {/* Column for Other */}
                            <Box className="selected-card-column other-column">
                                <Typography variant="h6" className="column-title">Other</Typography>
                                <div className="column-content">
                                    {selectedCards.filter(card => !["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Land"].some(type => card.type_line.includes(type))).map((card, index) => (
                                        <Box key={index} className="selected-card-item">
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => addCardToSelected(card)}>+</Button>
                                                <Typography className='counters'>{card.counters ? `${card.counters}x` : '0x'}</Typography>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px'}} onClick={() => removeCardFromSelected(card.id)}>-</Button>
                                            </div>
                                        </Box>
                                    ))}
                                </div>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogContent>
                    {selectedCard?.card_faces && selectedCard.card_faces.length > 1 ? (
                        <div className="card-faces-container">
                            {selectedCard.card_faces.map((face, index) => (
                                <div key={index} className="card-face">
                                    {face.image_uris?.normal && (
                                        <img src={face.image_uris.normal} alt={face.name} style={{ maxWidth: '100%' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {selectedCard?.image_uris?.normal && (
                                <img src={selectedCard.image_uris.normal} alt={selectedCard.name} style={{ maxWidth: '100%' }} />
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );}