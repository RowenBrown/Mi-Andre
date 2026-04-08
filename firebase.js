import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCz8nyXVBJHsOOVx2Fim74vCkAwwFTqFas",
  authDomain: "my-andre-63f26.firebaseapp.com",
  projectId: "my-andre-63f26",
  storageBucket: "my-andre-63f26.firebasestorage.app",
  messagingSenderId: "1021280623854",
  appId: "1:1021280623854:web:e95171f59c93b2936627ff"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
