'use strict';

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
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
const auth = getAuth(app);
const db = getFirestore(app);

// HTML Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');

// Display login errors
function showLoginError(message) {
    loginMessage.textContent = message;
}

// Login Form
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        showLoginError('Enter your email and password.');
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'SIGNING IN...';
    showLoginError('');

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        const messages = {
            'auth/invalid-credential': 'Incorrect email or password.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account is disabled.',
            'auth/too-many-requests': 'Too many attempts. Try again later.'
        };

        showLoginError(
            messages[error.code] || 'Login failed. Please try again.'
        );

        loginButton.disabled = false;
        loginButton.textContent = 'LOGIN TO DASHBOARD';
    }
});

// Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.hidden = true;
        dashboardScreen.hidden = false;

        dashboardScreen.innerHTML = `
            <h1>NETHA X ADMIN</h1>
            <p>Login successful.</p>
            <p>Welcome, ${escapeHTML(user.email || 'Admin')}</p>
            <button id="logoutButton">LOGOUT</button>
        `;

        document.getElementById('logoutButton')
            .addEventListener('click', async () => {
                await signOut(auth);
            });

    } else {
        loginScreen.hidden = false;
        dashboardScreen.hidden = true;

        loginButton.disabled = false;
        loginButton.textContent = 'LOGIN TO DASHBOARD';
        loginForm.reset();
        showLoginError('');
    }
});

// Safely display account information
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

console.log('NETHA X ADMIN Authentication Ready');

export { app, auth, db };
