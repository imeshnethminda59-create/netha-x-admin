'use strict';

// NETHA X ADMIN - Firebase Connection

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDI4FTCYDV33LUunaUGvYfqHWbCMIKZqUg",
    authDomain: "netha-x-admin.firebaseapp.com",
    projectId: "netha-x-admin",
    storageBucket: "netha-x-admin.firebasestorage.app",
    messagingSenderId: "270834163488",
    appId: "1:270834163488:web:414206ee37e88a55fe4145",
    measurementId: "G-YZSXGNY813"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

console.log("NETHA X ADMIN Firebase Connected");

// Export Firebase services
export { app, auth, db };
