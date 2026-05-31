const mongoose = require("mongoose");
const JersApp_GroupSchema = new mongoose.Schema(
  {
    group_name: { type: String, required: true },
    created_by: { type: String, required: true },
    image: Object,
    last_msg: Object,
    unread_msg: Number,
    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "JersApp_grp_message",
      },
    ],
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: "JersApp_grp_members",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const JersApp_Group = mongoose.model("JersApp_Group", JersApp_GroupSchema);
exports.JersApp_Group = JersApp_Group;
