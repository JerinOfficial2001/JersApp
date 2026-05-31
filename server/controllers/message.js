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
    const { chatID, sender, receiver, message } = req.body;
    if (req.user._id.toString() !== sender) {
      return res.status(403).json({ status: "error", message: "Forbidden: Sender spoofing detected" });
    }
    if (chatID != "" && sender != "" && receiver != "" && message != "") {
      const result = await JersApp_Message.create({
        chatID,
        sender,
        receiver,
        message,
      });

      // Auto-add contacts on message send
      await AddContacts({
        userID: sender,
        id: receiver,
        msg: { id: sender, msg: message },
      });
      await AddContacts({
        userID: receiver,
        id: sender,
        msg: { id: sender, msg: message },
      });

      res.status(200).json({ status: "ok", message: "Message send" });
    } else {
      res
        .status(400)
        .json({ status: "error", message: "All fields are mandatory" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "something Went wrong" });
  }
};
