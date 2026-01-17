import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAgXg5cAvaq6n3eO2Phtk1ypMf_vlzG-HU",
    authDomain: "yemeni-market-8d4ad.firebaseapp.com",
    projectId: "yemeni-market-8d4ad",
    storageBucket: "yemeni-market-8d4ad.firebasestorage.app",
    messagingSenderId: "142190324080",
    appId: "1:142190324080:web:4ddb7c6c29133e4a6bc7b5",
    measurementId: "G-4CNLJQM3VM"
};

// Initialize Firebase (Singleton pattern to avoid re-initialization errors)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Analytics only on client side
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, googleProvider, analytics };
