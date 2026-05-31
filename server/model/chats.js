const mongoose = require("mongoose");

const JersApp_ChatsSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
});

const JersApp_Chats = mongoose.model("JersApp_Chats", JersApp_ChatsSchema);
exports.JersApp_Chats = JersApp_Chats;
