const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config(); // Memuat variabel dari .env

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("../service-account.json")), // Sertifikat Service Account
  databaseURL: process.env.FIREBASE_DATABASE_URL, // URL database
});

// Firestore instance
const db = admin.firestore();

module.exports = { admin, db };
