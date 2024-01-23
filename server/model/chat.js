const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  username: String,
  message: String,
  recipient: String,
  createdAt: {type: Date, default: Date.now},
});
const Chat = mongoose.model('Chat', ChatSchema);
exports.Chat = Chat;
