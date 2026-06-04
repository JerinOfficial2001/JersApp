const express = require("express");
const {
  getAllMessage,
  deleteMsgs,
  deleteForMe,
  deleteForEveryone,
  addReaction,
  removeReaction,
  getLastMessage,
  sendMsg,
} = require("../controllers/message");
const {
  getMessages,
  deleteGroupMsgForMe,
  deleteGroupMsgForEveryone,
  addGroupReaction,
  removeGroupReaction,
  markGroupMsgAsRead,
} = require("../controllers/Groups/messages");
const authenticateJWT = require("../middleware/auth");
const { uploadMessageMedia } = require("../middleware/upload");
const route = express.Router();

route.get("/message", authenticateJWT, getAllMessage);
route.get("/lastMsg/:senderID/:receiverID", authenticateJWT, getLastMessage);
route.delete("/message", authenticateJWT, deleteMsgs);
route.post("/message", authenticateJWT, sendMsg);
route.post("/message/deleteForMe", authenticateJWT, deleteForMe);
route.post("/message/deleteForEveryone", authenticateJWT, deleteForEveryone);
route.post("/message/react", authenticateJWT, addReaction);
route.delete("/message/react", authenticateJWT, removeReaction);
route.post("/message/upload", authenticateJWT, uploadMessageMedia.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }
    const fileUrl = `/jersapp/uploads/messages/${req.file.filename}`;
    res.status(200).json({ status: "ok", fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ status: "error", message: "Upload failed" });
  }
});

//*Group
route.get("/groupMsg", authenticateJWT, getMessages);
route.post("/groupMsg/deleteForMe", authenticateJWT, deleteGroupMsgForMe);
route.post("/groupMsg/deleteForEveryone", authenticateJWT, deleteGroupMsgForEveryone);
route.post("/groupMsg/react", authenticateJWT, addGroupReaction);
route.delete("/groupMsg/react", authenticateJWT, removeGroupReaction);
route.post("/groupMsg/read", authenticateJWT, markGroupMsgAsRead);

module.exports = route;
