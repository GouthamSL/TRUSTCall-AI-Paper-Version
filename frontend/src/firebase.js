// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBmLD7wt3nP77UkKJi2DLozNFehYrxcAaE",
  authDomain: "trustcall-ai-16ce9.firebaseapp.com",
  projectId: "trustcall-ai-16ce9",
  storageBucket: "trustcall-ai-16ce9.firebasestorage.app",
  messagingSenderId: "59156287728",
  appId: "1:59156287728:web:843e41896a725fd7e77235",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);