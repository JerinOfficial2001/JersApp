const mongoose = require("mongoose");
const JersApp_grp_membersSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  role: { type: String, required: true },
});

const JersApp_grp_members = mongoose.model(
  "JersApp_grp_members",
  JersApp_grp_membersSchema
);
exports.JersApp_grp_members = JersApp_grp_members;
