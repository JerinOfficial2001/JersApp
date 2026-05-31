const express = require("express");
const {
  getAllMessage,
  deleteMsgs,
  getLastMessage,
  sendMsg,
} = require("../controllers/message");
const { getMessages } = require("../controllers/Groups/messages");
const authenticateJWT = require("../middleware/auth");
const { uploadMessageMedia } = require("../middleware/upload");
const route = express.Router();

route.get("/message", authenticateJWT, getAllMessage);
route.get("/lastMsg/:senderID/:receiverID", authenticateJWT, getLastMessage);
route.delete("/message", authenticateJWT, deleteMsgs);
route.post("/message", authenticateJWT, sendMsg);
route.post("/message/upload", authenticateJWT, uploadMessageMedia.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }
    const fileUrl = `/uploads/messages/${req.file.filename}`;
    res.status(200).json({ status: "ok", fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ status: "error", message: "Upload failed" });
  }
});
//*Group
route.get("/groupMsg", authenticateJWT, getMessages);

module.exports = route;
