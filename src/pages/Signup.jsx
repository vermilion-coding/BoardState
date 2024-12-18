import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getFirestore, collection, addDoc} from 'firebase/firestore'; // Import Firestore functions

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  //Handles setting a new user's email
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  //Handles setting a new user's password
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  //Password confirmation
  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create a new Firestore collection for the user
        const db = getFirestore();
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, { email: userCredential.user.email });

        // Create a new "decks" collection inside the user document
        const decksCollectionRef = collection(userRef, 'decks');
        await addDoc(decksCollectionRef, { placeholder: 'placeholder' }); // Example field, add your desired data here

        // Show success message and redirect to home page
        alert('Sign up successful!');
        navigate('/');
    } catch (error) {
        setError(error.message);
    }
};
  return (
    <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
      <Grid item xs={10} sm={8} md={6} lg={4}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Sign Up
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={handleEmailChange}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={handlePasswordChange}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Sign Up
            </Button>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SignUpPage;
