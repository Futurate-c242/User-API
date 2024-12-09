const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyBIOA4EzLWRXvyDfAvMcN8Im4xGyi9Xueg",
  authDomain: "futurate-c242-ps489.firebaseapp.com",
  projectId: "futurate-c242-ps489",
  storageBucket: "futurate-c242-ps489.appspot.com",
  messagingSenderId: "352594405825",
  appId: "1:352594405825:web:2d0c36fd3e222917df2740",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = { auth, db, storage };
