const express = require("express");
const {
  getUsers,
  register,
  userData,
  login,
  logout,
  GetUsersByID,
  updateProfile,
  updateTheme,
  GetUsersByIDs,
} = require("../controllers/users");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const { uploadProfile } = require("../middleware/upload");

// Auth routes (no JWT required)
router.post("/register", uploadProfile.single("image"), register);
router.post("/login", login);

// Get current user from token (used after login to hydrate session)
router.get("/me", userData);

// Legacy: keep /login GET for backwards compat
router.get("/login", userData);

// Token acknowledgement endpoint (mobile stores token; server just acks)
router.post("/token", (req, res) => {
  res.status(200).json({ status: "ok", message: "Token received" });
});

// Logout (stateless — client clears storage; server acknowledges)
router.post("/logout", logout);

// Authenticated routes
router.get("/getUsers", authenticateJWT, getUsers);
router.get("/get/:id", authenticateJWT, GetUsersByID);
router.put("/update/:id", authenticateJWT, uploadProfile.single("image"), updateProfile);
router.post("/getByIds", authenticateJWT, GetUsersByIDs);
router.post("/updateTheme/:id", authenticateJWT, updateTheme);

module.exports = router;
