import mongoose from 'mongoose';

let Message;

if (mongoose.models && mongoose.models.Message) {
  Message = mongoose.model('Message');
} else {
  const messageSchema = new mongoose.Schema({
    chatID: String,
    sender: String,
    receiver: String,
    message: String,
  });

  Message = mongoose.model('Message', messageSchema);
}

export default Message;
