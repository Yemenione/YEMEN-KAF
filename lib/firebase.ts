import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyD93noyqMOfh5-jgcktTF9IcKM16j4qcDE",
    authDomain: "yemeni-marke.firebaseapp.com",
    projectId: "yemeni-marke",
    storageBucket: "yemeni-marke.firebasestorage.app",
    messagingSenderId: "671802064897",
    appId: "1:671802064897:web:3ba4c371a910d707a20000",
    measurementId: "G-24NKEQ1HDN"
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
