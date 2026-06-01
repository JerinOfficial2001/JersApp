const { JersApp_Auth } = require("../../model/auth");
const { JersApp_Group } = require("../../model/Groups/group");
const { JersApp_grp_message } = require("../../model/Groups/message");
const { getContactByUserID } = require("../../services/contacts");
const { authenticateByTokenAndUserID } = require("../../utils/Authentication");

exports.getMessages = async (req, res, next) => {
  const { userID, groupID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const group = await JersApp_Group.findById(groupID).populate(
          "messages"
        );

        if (group) {
          let messages = [];
          for (let msg of group.messages) {
            const user = await JersApp_Auth.findById(msg.sender_id);
            const contact = await getContactByUserID(msg.sender_id, userID);
            const { image, name, mobNum, ...otherDatas } = user.toObject();
            const newObj = Object.assign({}, msg.toObject(), {
              name,
              image,
              given_name: contact ? contact.given_name : null,
              phone: mobNum,
            });
            messages.push(newObj);
          }
          res.status(200).json({ status: "ok", data: messages });
        } else {
          res.status(200).json({ status: "error", message: "Group not found" });
        }
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("getMessages", error);
    next(error);
  }
};

exports.deleteGroupMsgForMe = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_grp_message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });
    
    if (!msg.deletedFor.includes(userId)) {
      msg.deletedFor.push(userId);
      await msg.save();
    }
    res.status(200).json({ status: "ok", message: "Deleted for me" });
  } catch (error) {
    console.error("deleteGroupMsgForMe Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.deleteGroupMsgForEveryone = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_grp_message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });

    if (msg.sender_id !== userId) {
      return res.status(403).json({ status: "error", message: "Only sender can delete for everyone" });
    }

    const ONE_HOUR = 3600000;
    const now = new Date();
    const messageTime = new Date(msg.createdAt);
    if (now - messageTime > ONE_HOUR) {
      return res.status(400).json({ status: "error", message: "Time limit exceeded" });
    }

    msg.deletedForEveryone = true;
    msg.msg = "";
    msg.fileUrl = null;
    msg.fileType = null;
    await msg.save();

    res.status(200).json({ status: "ok", message: "Deleted for everyone" });
  } catch (error) {
    console.error("deleteGroupMsgForEveryone Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.addGroupReaction = async (req, res) => {
  const { messageId, userId, emoji } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_grp_message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });

    msg.reactions = msg.reactions.filter(r => r.userId !== userId);
    msg.reactions.push({ userId, emoji });
    await msg.save();

    res.status(200).json({ status: "ok", message: "Reaction added" });
  } catch (error) {
    console.error("addGroupReaction Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.removeGroupReaction = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_grp_message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });

    msg.reactions = msg.reactions.filter(r => r.userId !== userId);
    await msg.save();

    res.status(200).json({ status: "ok", message: "Reaction removed" });
  } catch (error) {
    console.error("removeGroupReaction Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.markGroupMsgAsRead = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const msg = await JersApp_grp_message.findById(messageId);
    if (!msg) return res.status(404).json({ status: "error", message: "Not found" });

    if (!msg.readBy.includes(userId)) {
      msg.readBy.push(userId);
      await msg.save();
    }

    res.status(200).json({ status: "ok", message: "Marked as read" });
  } catch (error) {
    console.error("markGroupMsgAsRead Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
