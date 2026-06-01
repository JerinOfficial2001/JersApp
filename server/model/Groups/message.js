const mongoose = require("mongoose");
const JersApp_grp_messageSchema = new mongoose.Schema(
  {
    sender_id: { type: String, required: true },
    group_id: { type: String, required: true },
    msg: { type: String, default: "" },
    fileUrl: { type: String, default: null },
    fileType: { type: String, enum: ["image", "video", "audio", "document", null], default: null },
    replyTo: { type: Object, default: null }, // { messageId, sender, message, fileType }
    deletedFor: { type: [String], default: [] },
    deletedForEveryone: { type: Boolean, default: false },
    reactions: { type: [{ userId: String, emoji: String }], default: [] },
    readBy: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const JersApp_grp_message = mongoose.model(
  "JersApp_grp_message",
  JersApp_grp_messageSchema
);
exports.JersApp_grp_message = JersApp_grp_message;
