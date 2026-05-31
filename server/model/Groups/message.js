const mongoose = require("mongoose");
const JersApp_grp_messageSchema = new mongoose.Schema(
  {
    sender_id: { type: String, required: true },
    group_id: { type: String, required: true },
    msg: { type: String, required: true },
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
