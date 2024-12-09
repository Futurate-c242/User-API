const express = require("express");
const multer = require("multer");
const { storage, db } = require("../utils/firebase");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { doc, updateDoc } = require("firebase/firestore");

const router = express.Router();

// Konfigurasi multer untuk upload file
const storageMulter = multer.memoryStorage();
const upload = multer({ storage: storageMulter });

// Update profile
router.put("/profile/edit", upload.single("profileImage"), async (req, res) => {
  const { uid, uname, name, email } = req.body;
  const profileImage = req.file;

  try {
    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Data untuk update
    const updateData = {};
    if (uname) updateData.uname = uname;
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Upload foto profil jika ada
    if (profileImage) {
      const fileName = `profile_images/${uid}_${Date.now()}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, profileImage.buffer);
      const fileUrl = await getDownloadURL(storageRef);

      updateData.profileImageUrl = fileUrl;
    }

    // Update data di Firestore
    await updateDoc(doc(db, "users", uid), updateData);

    res.status(200).json({
      message: "Profile updated successfully",
      updatedData: updateData,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
