const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  chatID: String,
  sender: String,
  receiver: String,
  message: String,
});
const Message = mongoose.model('Message', messageSchema);
exports.Message = Message;
