const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const { uploadStatus } = require("../middleware/upload");
const {
  getAllStatus,
  addStatus,
  deleteStatus,
  getStatusByID,
} = require("../controllers/status");

router.get("/get", authenticateJWT, getAllStatus);
router.post("/add", authenticateJWT, uploadStatus.array("file"), addStatus);
router.get("/get/:id", authenticateJWT, getStatusByID);
router.delete("/delete/:id", authenticateJWT, deleteStatus);

module.exports = router;
