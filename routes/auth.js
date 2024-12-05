const express = require("express");
const bcrypt = require("bcrypt"); // Untuk hashing password
const multer = require("multer"); // Untuk menangani upload file
const { admin, db } = require("../utils/firebase");

const router = express.Router();

// Konfigurasi multer untuk upload file
const storage = multer.memoryStorage();
const upload = multer({ storage });

// API Register
router.post("/register", async (req, res) => {
  const { email, password, name, uname } = req.body;

  try {
    // Validasi input
    if (!email || !password || !name || !uname) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Periksa apakah username sudah ada
    const unameExists = await db
      .collection("users")
      .where("uname", "==", uname)
      .get();

    if (!unameExists.empty) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun pengguna di Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password, // Firebase Auth juga menyimpan password (hash sendiri secara internal)
      displayName: name,
    });

    // Simpan data tambahan ke Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      password: hashedPassword, // Simpan password hash di Firestore
      uname,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "User registered successfully",
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ error: error.message });
  }
});

// API Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari pengguna berdasarkan email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnapshot.docs[0].data();

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Buat custom token untuk login
    const customToken = await admin.auth().createCustomToken(userSnapshot.docs[0].id);

    res.status(200).json({
      message: "Login successful",
      token: customToken,
      user: {
        email: userData.email,
        name: userData.name,
        uname: userData.uname,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API Edit Profile
router.put("/profile/edit", upload.single("profileImage"), async (req, res) => {
  const { uid, uname, name, email, password } = req.body;
  const profileImage = req.file;

  try {
    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Cari pengguna berdasarkan UID
    const userRef = db.collection("users").doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: "User not found" });
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
      const bucket = admin.storage().bucket('futurate_c242');
      const fileName = `profile_images/${uid}_${Date.now()}`;
      const file = bucket.file(fileName);

      await file.save(profileImage.buffer, {
        contentType: profileImage.mimetype,
      });

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      updateData.profileImageUrl = fileUrl;
    }

    // Update data di Firestore
    await userRef.update(updateData);

    res.status(200).json({
      message: "Profile updated successfully",
      updatedData: updateData,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  console.log("Uploaded file:", req.file);
  if (profileImage) {
    await bucket.file(`test/${profileImage.originalname}`).save(profileImage.buffer, {
      contentType: profileImage.mimetype,
    });
    console.log("Upload successful");
  }
  console.log("File in request:", req.file);
});

module.exports = router;
