const mongoose = require("mongoose");
const JersApp_MessageSchema = new mongoose.Schema(
  {
    chatID: String,
    sender: String,
    receiver: String,
    message: String,
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      enum: ["image", "video", "audio", "document", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
const JersApp_Message = mongoose.model(
  "JersApp_Message",
  JersApp_MessageSchema
);
exports.JersApp_Message = JersApp_Message;
