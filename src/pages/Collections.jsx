import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Box, TextField, Button, Typography, Dialog, DialogContent, DialogActions } from '@mui/material';
import { getFirestore, deleteDoc, doc, setDoc, updateDoc, collection, getDoc, addDoc, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { getAuth } from 'firebase/auth';
import './Collections.css'; // Update the CSS file name if necessary

export default function Collections() {
    const [selectedCollectionCards, setSelectedCollectionCards] = useState([]);
    const [collections, setCollections] = useState([]);
    const [currentCollection, setCurrentCollection] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [showCollection, setShowCollection] = useState(true);
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

    const selectCollection = async (collectionId) => {
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
            const collectionsCollectionRef = collection(userDocRef, 'collections');
            const collectionRef = doc(collectionsCollectionRef, collectionId);

            const cardsCollectionRef = collection(collectionRef, 'cards');
            const cardsSnapshot = await getDocs(cardsCollectionRef);

            const selectedCards = cardsSnapshot.docs.map(cardDoc => {
                const cardData = cardDoc.data();
                return {
                    id: cardDoc.id,
                    name: cardData.name,
                    counters: cardData.counters,
                };
            });

            setSelectedCollectionCards(selectedCards);
            setCurrentCollection(collectionRef);
            setShowCollection(false);
        } catch (error) {
            console.error('Error getting selected collection cards:', error);
        }

    };

    const addCardToSelectedCollection = async (card) => {
        try {
            const db = getFirestore();
            const user = getAuth().currentUser;
            if (!db || !user) {
                console.error('Firestore instance not available or user not logged in');
                return;
            }

            const userDocRef = doc(db, 'users', user.uid);
            const collectionRef = doc(collection(userDocRef, 'collections'), currentCollection.id);

            const selectedCollectionCardsRef = collection(collectionRef, 'cards');
            const cardDocRef = doc(selectedCollectionCardsRef, card.id);

            const cardDocSnapshot = await getDoc(cardDocRef);
            if (!cardDocSnapshot.exists()) {
                const cardData = {
                    name: card.name,
                    counters: 1
                };

                if (card.card_faces && card.card_faces.length > 1) {
                    cardData.image_uris = card.card_faces.map(face => ({ normal: face.image_uris.normal }));
                } else {
                    cardData.image_uris = { normal: card.image_uris.normal };
                }

                const selectedCollectionCardsCollection = await getDocs(selectedCollectionCardsRef);
                if (selectedCollectionCardsCollection.empty) {
                    await setDoc(collectionRef, { name: currentCollection.name || 'Untitled Collection', cards: [] });
                }

                await setDoc(cardDocRef, cardData);
            } else {
                await updateDoc(cardDocRef, {
                    counters: cardDocSnapshot.data().counters + 1
                });
            }

            if (!cardDocSnapshot.exists()) {
                const updatedSelectedCollectionCards = [...selectedCollectionCards, { ...card, counters: 1 }];
                setSelectedCollectionCards(updatedSelectedCollectionCards);
            }

            await selectCollection(currentCollection.id);
        } catch (error) {
            console.error('Error adding card to selected collection:', error);
        }
    };

    const removeCardFromSelectedCollection = async (cardId) => {
        try {
            const db = getFirestore();
            const user = getAuth().currentUser;
            if (!db || !user) {
                console.error('Firestore instance not available or user not logged in');
                return;
            }

            const userDocRef = doc(db, 'users', user.uid);
            const collectionRef = doc(collection(userDocRef, 'collections'), currentCollection.id);

            const selectedCollectionCardsRef = collection(collectionRef, 'cards');
            const cardDoc = doc(selectedCollectionCardsRef, cardId);

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
            await selectCollection(currentCollection.id);

        } catch (error) {
            console.error('Error removing card from selected collection:', error);
        }
    };

    const createNewCollection = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            return;
        }

        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (!userDocSnapshot.exists()) {
            return;
        }

        const newCollectionRef = await addDoc(collection(userDocRef, 'collections'), {
            name: `Untitled Binder`,
        });

        const newCollection = {
            id: newCollectionRef.id,
            name: `Untitled Binder`,
        };

        const updatedCollections = [...collections, newCollection];
        setCollections(updatedCollections);
        setCurrentCollection(newCollection);
    };


    const deleteCollection = async (collectionId) => {
        const updatedCollections = collections.filter(collection => collection.id !== collectionId);
        setCollections(updatedCollections);
        setCurrentCollection(null);
        setSelectedCollectionCards([]);

        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const collectionRef = doc(collection(userDocRef, 'collections'), collectionId);
            await deleteDoc(collectionRef);
        }
    };

    const renameCollection = async (collectionId) => {
        const newName = prompt("Enter a new name for the collection:", collections.find(collection => collection.id === collectionId).name);
        if (newName !== null) {
            const updatedCollections = collections.map(collection =>
                collection.id === collectionId ? { ...collection, name: newName } : collection
            );
            setCollections(updatedCollections);
            if (currentCollection && currentCollection.id === collectionId) {
                setCurrentCollection({ ...currentCollection, name: newName });
            }

            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const db = getFirestore();
                const userDocRef = doc(db, 'users', user.uid);
                const collectionRef = doc(collection(userDocRef, 'collections'), collectionId);
                await updateDoc(collectionRef, { name: newName });
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

    const exportCollection = async (collectionId) => {
        try {
            const db = getFirestore();
            const user = getAuth().currentUser;
            if (!db || !user) {
                console.error('Firestore instance not available or user not logged in');
                return;
            }

            const userDocRef = doc(db, 'users', user.uid);
            const collectionRef = doc(collection(userDocRef, 'collections'), collectionId);
            const collectionDoc = await getDoc(collectionRef);

            if (!collectionDoc.exists()) {
                console.error('Collection not found');
                return;
            }

            const cardsCollectionRef = collection(collectionRef, 'cards');
            const cardsSnapshot = await getDocs(cardsCollectionRef);

            const collectionCardCounts = {};
            cardsSnapshot.forEach(cardDoc => {
                const cardData = cardDoc.data();
                collectionCardCounts[cardDoc.id] = cardData.counters;
            });

            const collectionList = await Promise.all(cardsSnapshot.docs.map(async cardDoc => {
                const cardData = cardDoc.data();
                const cardName = cardData.name;
                return `${collectionCardCounts[cardDoc.id] || 1}x ${cardName}`;
            }));

            const blob = new Blob([collectionList.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${collectionDoc.data().name}_Collection.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting collection:', error);
        }
    };

    const handleBackButtonClick = () => {
        setShowCollection(true);
        setCurrentCollection(null);
        setSelectedCollectionCards([]);
    };

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        const fetchCollections = async () => {
            if (!user || !db) {
                return;
            }

            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnapshot = await getDoc(userDocRef);

            if (!userDocSnapshot.exists()) {
                return;
            }

            const userCollectionsRef = collection(userDocRef, 'collections');
            const userCollectionsSnapshot = await getDocs(userCollectionsRef);

            const userCollections = await Promise.all(userCollectionsSnapshot.docs.map(async doc => {
                const collectionData = doc.data();

                const cardsSnapshot = await getDocs(collection(userCollectionsRef, doc.id, 'cards'));
                const cards = cardsSnapshot.docs.map(cardDoc => cardDoc.data());

                return {
                    id: doc.id,
                    ...collectionData,
                    cards: cards
                };
            }));

            setCollections(userCollections);
        };

        fetchCollections();

        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchCollections();
            }
        });

        return () => unsubscribe();
    }, [db, addCardToSelectedCollection, removeCardFromSelectedCollection]);

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                {showCollection ? (
                    <Grid item xs={12}>
                        <Box className="collection-container" p={2}>
                            <div className="welcome-section">
                                <Typography variant="h5" align="center" gutterBottom>Welcome to the Collection Manager!</Typography>
                                <Button className="new-collection-button" variant="contained" onClick={createNewCollection}>New Binder</Button>
                            </div>
                            <Grid container spacing={2}>
                                {collections.sort((a, b) => a.id - b.id).map(collection => (
                                    <Grid key={collection.id} item xs={12} sm={4}>
                                        <Box className="collection-box" p={2}>
                                            <div>
                                                <Typography variant="h4">{collection.name}</Typography>
                                            </div>
                                            <div className="collection-actions">
                                                <Button variant="contained" onClick={() => selectCollection(collection.id)}>Edit</Button>
                                                <Button variant="contained" onClick={() => deleteCollection(collection.id)}>Delete</Button>
                                                <Button variant="contained" onClick={() => renameCollection(collection.id)}>Rename</Button>
                                                <Button variant="contained" onClick={() => exportCollection(collection.id)}>Export</Button>
                                            </div>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                ) : (
                    <Grid item xs={12} sm={12}>
                        <Box className="current-collection-box" p={2} display="flex" alignItems="center">
                            <Button variant="contained" style={{ borderRadius: '10px', fontSize: "18px"}} onClick={handleBackButtonClick}>Back</Button>
                            <Typography variant="h4" style={{ marginLeft: 'auto' }}>{currentCollection.name}</Typography>
                        </Box>
                    </Grid>
                )}
                {!showCollection && (
                    <>
                        <Grid item xs={12} sm={5}>
                            <Box className="selected-cards-box" p={2}>
                                <Box className="selected-cards-list" style={{ height: '630px', overflowY: 'auto' }}>
                                    {selectedCollectionCards.map((card, index) => (
                                        <Box key={index} className="selected-card-item" display="flex" alignItems="center" justifyContent="space-between" my={1} p={1}>
                                            <Typography>{card.counters ? `${card.counters}x` : '0x'}</Typography>
                                            <Typography onClick={() => handleCardNameClick(card)} style={{ cursor: 'pointer' }}>{card.name}</Typography>
                                            <div>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px"}} onClick={() => addCardToSelectedCollection(card)}>+</Button>
                                                <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "18px"}} onClick={() => removeCardFromSelectedCollection(card.id)}>-</Button>
                                            </div>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="search-results-box" p={2}>
                                <Typography variant="h5" style={{ textAlign: 'center', padding: '1vw' }}>Search</Typography>
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
                                            padding: '1vw' // Use viewport width for padding
                                        }
                                    }}
                                />

                                <Box className="search-results-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {searchResults.map(card => (
                                        <Box key={card.id} className="search-result-item" display="flex" alignItems="center" justifyContent="space-between" my={1} p={1} onClick={(e) => { if (!e.target.closest('button')) handleCardNameClick(card) }}>
                                            <Typography>{card.name}</Typography>
                                            <Button variant="contained" size="small" style={{ borderRadius: '10px', fontSize: "14px"}} onClick={(e) => { e.stopPropagation(); addCardToSelectedCollection(card) }}>Add</Button>
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
    );
}
