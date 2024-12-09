const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { auth, db, storage } = require("../utils/firebase");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } = require("firebase/auth");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { doc, setDoc, getDoc, query, where, collection, getDocs, updateDoc } = require("firebase/firestore");

const router = express.Router();

// Konfigurasi multer untuk upload file
const storageConfig = multer.memoryStorage();
const upload = multer({ storage: storageConfig });

// **API Register**
router.post("/register", async (req, res) => {
  const { email, password, name, uname } = req.body;

  try {
    if (!email || !password || !name || !uname) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Cek apakah username sudah digunakan
    const unameQuery = query(collection(db, "users"), where("uname", "==", uname));
    const unameSnapshot = await getDocs(unameQuery);
    if (!unameSnapshot.empty) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Buat akun pengguna di Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Simpan data tambahan ke Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      name,
      uname,
      password: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User registered successfully", uid: user.uid });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ error: error.message });
  }
});

// **API Login**
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = query(collection(db, "users"), where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// **API Edit Profile**
router.put('/profile/edit', upload.single('profileImage'), async (req, res) => {
    const { uid, uname, name, email, password } = req.body;
    const profileImage = req.file;
  
    try {
      if (!uid) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      // Data untuk update
      const updateData = {};
      if (uname) updateData.uname = uname;
      if (name) updateData.name = name;
      if (email) updateData.email = email;
  
      // Hash password jika diubah
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }
  
      // Upload foto profil jika ada
      if (profileImage) {
        const storageRef = ref(storage, `profile_images/${uid}_${Date.now()}`);
        await uploadBytes(storageRef, profileImage.buffer, {
          contentType: profileImage.mimetype,
        });
  
        // Setelah upload selesai, ambil URL file
        const fileUrl = await getDownloadURL(storageRef);
  
        // Tambahkan URL gambar ke data pembaruan
        updateData.profileImageUrl = fileUrl;
      }
  
      // Update data pengguna di Firestore
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updateData);
  
      res.status(200).json({
        message: 'Profile updated successfully',
        updatedData: updateData,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
