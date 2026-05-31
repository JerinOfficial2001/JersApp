const { JersApp_Chats } = require("../model/chats");

/**
 * GET /api/chat?senderID=...&receiverID=...
 * Find or return the chat room between two users
 */
exports.getChat = async (req, res) => {
  try {
    const { senderID, receiverID } = req.query;
    if (!senderID || !receiverID) {
      return res.status(400).json({ status: "error", message: "senderID and receiverID are required" });
    }

    const chat = await JersApp_Chats.findOne({
      $or: [
        { sender: senderID, receiver: receiverID },
        { sender: receiverID, receiver: senderID },
      ],
    });

    if (chat) {
      res.status(200).json({ status: "ok", data: chat });
    } else {
      res.status(200).json({ status: "ok", data: null, message: "No chat found" });
    }
  } catch (error) {
    console.error("getChat Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

/**
 * POST /api/chat
 * Create or get existing chat room between two users
 */
exports.createChat = async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    if (!sender || !receiver) {
      return res.status(400).json({ status: "error", message: "sender and receiver are required" });
    }

    // Check if chat already exists
    let chat = await JersApp_Chats.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (!chat) {
      chat = await JersApp_Chats.create({ sender, receiver });
    }

    res.status(200).json({ status: "ok", message: chat, data: chat });
  } catch (error) {
    console.error("createChat Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
