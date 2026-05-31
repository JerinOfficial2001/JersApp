const { JersApp_Chats } = require("../model/chats");
const { JersApp_Contact } = require("../model/contacts");
const { JersApp_Message } = require("../model/message");
const { getContactByUserID } = require("../services/contacts");
const { getUserDataFromToken } = require("../utils/Authentication");
const { AddContacts } = require("./socketContacts");

exports.getAllMessage = async (req, res, next) => {
  const userData = req.user;
  try {
    // Filter by chatID if provided (avoids loading all messages)
    const query = req.query.chatID ? { chatID: req.query.chatID } : {};
    
    // Also filter out messages where this user has deleted it "for me"
    if (userData && userData._id) {
      query.deletedFor = { $ne: userData._id.toString() };
    }

    const response = await JersApp_Message.find(query).sort({ createdAt: 1 });
    if (userData) {
      res.status(200).json({ status: "ok", data: response });
    } else {
      res.status(401).json({ status: "error", message: "Un-Authorized" });
    }
  } catch (error) {
    console.error("getAllMessage Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
exports.deleteMsgs = async (req, res, next) => {
  const { id } = req.query;
  try {
    const result = await JersApp_Message.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ status: "ok", message: "deleted" });
    } else {
      res.status(200).json({ status: "ok", message: "No data found" });
    }
  } catch (error) {
    next("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteForMe = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_Message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });
    
    if (!msg.deletedFor.includes(userId)) {
      msg.deletedFor.push(userId);
      await msg.save();
    }
    res.status(200).json({ status: "ok", message: "Deleted for me" });
  } catch (error) {
    console.error("deleteForMe Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.deleteForEveryone = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_Message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });

    // Ensure only the sender can delete for everyone
    if (msg.sender !== userId) {
      return res.status(403).json({ status: "error", message: "Only sender can delete for everyone" });
    }

    // Time window check: 1 hour (3600000 ms)
    const ONE_HOUR = 3600000;
    const now = new Date();
    const messageTime = new Date(msg.createdAt);
    if (now - messageTime > ONE_HOUR) {
      return res.status(400).json({ status: "error", message: "Time limit exceeded to delete for everyone" });
    }

    msg.deletedForEveryone = true;
    msg.message = "";
    msg.fileUrl = null;
    msg.fileType = null;
    await msg.save();

    // Check if this message was the last message for the sender or receiver contacts
    // Update the lastMsg field on JersApp_Contact to say "This message was deleted"
    const JersApp_Contact = require("../model/contacts").JersApp_Contact;
    
    // Find contacts related to this chat room
    // The contacts will have user_id = msg.receiver (for sender's contact) and vice-versa
    const contacts = await JersApp_Contact.find({
      $or: [
        { creator_id: msg.sender, user_id: msg.receiver },
        { creator_id: msg.receiver, user_id: msg.sender }
      ]
    });

    for (let contact of contacts) {
      if (contact.lastMsg && contact.lastMsg.id) {
        // Find the actual last message in this chat
        const lastMsgs = await JersApp_Message.find({ chatID: msg.chatID })
          .sort({ createdAt: -1 })
          .limit(1);
          
        if (lastMsgs.length > 0) {
          const actualLastMsg = lastMsgs[0];
          contact.lastMsg = {
            id: actualLastMsg.sender,
            msg: actualLastMsg.deletedForEveryone ? "🚫 This message was deleted" : actualLastMsg.message,
            fileType: actualLastMsg.fileType,
          };
          await contact.save();
        }
      }
    }

    res.status(200).json({ status: "ok", message: "Deleted for everyone" });
  } catch (error) {
    console.error("deleteForEveryone Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.addReaction = async (req, res) => {
  const { messageId, userId, emoji } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_Message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });

    // Remove existing reaction from this user if any
    msg.reactions = msg.reactions.filter(r => r.userId !== userId);
    
    // Add new reaction
    msg.reactions.push({ userId, emoji });
    await msg.save();

    res.status(200).json({ status: "ok", message: "Reaction added" });
  } catch (error) {
    console.error("addReaction Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.removeReaction = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_Message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });

    msg.reactions = msg.reactions.filter(r => r.userId !== userId);
    await msg.save();

    res.status(200).json({ status: "ok", message: "Reaction removed" });
  } catch (error) {
    console.error("removeReaction Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
exports.getLastMessage = async (req, res) => {
  try {
    const chatIDs = [req.params.senderID, req.params.receiverID];
    if (!chatIDs.includes(req.user._id.toString())) {
      return res.status(403).json({ status: "error", message: "Forbidden: You cannot access this chat history" });
    }
    const chats = await JersApp_Chats.find({});

    const filteredChats = chats.find((i) =>
      chatIDs.every((id) => i.sender == id || i.receiver == id)
    );

    const lastMsg = await JersApp_Message.find({ chatID: filteredChats._id });
    res.status(200).json({
      status: "ok",
      data: {
        message: lastMsg[lastMsg.length - 1].message,
        sender: lastMsg[lastMsg.length - 1].sender,
      },
    });
  } catch (error) {
    res.status(404).json({ status: "error", message: "something Went wrong" });
  }
};
exports.UpdateLastMsg = async (req, res) => {
  try {
    const ID1 = req.params.senderID;
    const ID2 = req.params.receiverID;
    if (ID1 && ID2) {
      const contact1 = await JersApp_Contact.findById(ID1);
      const contact2 = await JersApp_Contact.findById(ID2);
      if (contact1 && contact2) {
        const UpdatedContact1 = {
          Contact_id: contact1.Contact_id,
          name: contact1.name,
          user_id: contact1.user_id,
          ContactDetails: contact1.ContactDetails,
          lastMsg: req.body.lastMsg,
        };
        const UpdatedContact2 = {
          Contact_id: contact2.Contact_id,
          name: contact2.name,
          user_id: contact2.user_id,
          ContactDetails: contact2.ContactDetails,
          lastMsg: req.body.lastMsg,
        };
        const contact1Result = await JersApp_Contact.findByIdAndUpdate(
          ID1,
          UpdatedContact1
        );
        const contact2Result = await JersApp_Contact.findByIdAndUpdate(
          ID2,
          UpdatedContact2
        );
        if (contact1Result && contact2Result) {
          res.status(200).json({
            status: "ok",
            message: "Updated successfully",
          });
        } else {
          res.status(200).json({
            status: "error",
            message: "failed",
          });
        }
      } else {
        if (!contact1) {
          res.status(200).json({
            status: "error",
            message: "contact1 not found",
          });
        } else {
          res.status(200).json({
            status: "error",
            message: "contact1 not found",
          });
        }
      }
    } else {
      res.status(200).json({
        status: "error",
        message: "ID required",
      });
    }
  } catch (error) {
    res.status(404).json({ status: "error", message: "something Went wrong" });
  }
};
exports.sendMsg = async (req, res) => {
  try {
    const { chatID, sender, receiver, message, fileType, replyTo } = req.body;
    if (req.user._id.toString() !== sender) {
      return res.status(403).json({ status: "error", message: "Forbidden: Sender spoofing detected" });
    }
    if (chatID != "" && sender != "" && receiver != "") {
      const result = await JersApp_Message.create({
        chatID,
        sender,
        receiver,
        message,
        fileType: fileType || null,
        replyTo: replyTo || null,
      });

      // Auto-add contacts on message send
      await AddContacts({
        userID: sender,
        id: receiver,
        msg: { id: sender, msg: message, fileType: fileType || null },
      });
      await AddContacts({
        userID: receiver,
        id: sender,
        msg: { id: sender, msg: message, fileType: fileType || null },
      });

      res.status(200).json({ status: "ok", message: "Message send", data: result });
    } else {
      res
        .status(400)
        .json({ status: "error", message: "All fields are mandatory" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "something Went wrong" });
  }
};
