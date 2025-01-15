const express = require("express");
const router = express.Router();
// import { auth } from "../config/firebase";

// Firebase configuration
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyDPHyob9jTfcQCgOB0aNuX0n5OdGSzkAtE",
    authDomain: "hotel-data-store.firebaseapp.com",
    databaseURL: "https://hotel-data-store-default-rtdb.firebaseio.com",
    projectId: "hotel-data-store",
    storageBucket: "hotel-data-store.appspot.com",
    messagingSenderId: "995060333011",
    appId: "1:995060333011:web:461196f934001f70909726",
    measurementId: "G-76QW5MV4PF"
  };

  const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Signup route
router.post("/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email and password are required" 
        });
      }
  
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      const user = userCredential.user;
    //   const token = await user.getIdToken();
  
      res.status(201).json({
        message: "User created successfully",
        userId: user.uid,
        email: user.email,
        // token
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({
        error: error.message
      });
    }
  });
  
  // Login route
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email and password are required" 
        });
      }
  
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      const user = userCredential.user;
    //   const token = await user.getIdToken();
  
      res.json({
        message: "Login successful",
        userId: user.uid,
        email: user.email,
        // token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({
        error: error.message
      });
    }
  });
  
  module.exports = router;