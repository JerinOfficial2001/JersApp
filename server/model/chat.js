const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  user: String,
  message: String,
  receiver: String,
});
const Chat = mongoose.model('Chat', ChatSchema);
exports.Chat = Chat;
