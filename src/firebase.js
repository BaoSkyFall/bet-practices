// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcuLK7xde19Wc1whDmDlvba8-3lKZop_4",
    authDomain: "skyfall-f3249.firebaseapp.com",
    databaseURL: "https://skyfall-f3249.firebaseio.com",
    projectId: "skyfall-f3249",
    storageBucket: "skyfall-f3249.firebasestorage.app",
    messagingSenderId: "838787651786",
    appId: "1:838787651786:web:86c2d73bd641f0f86efc33"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
