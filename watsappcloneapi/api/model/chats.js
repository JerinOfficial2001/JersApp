import mongoose from 'mongoose';

let Chats;

if (mongoose.models && mongoose.models.Chats) {
  Chats = mongoose.model('Chats');
} else {
  const ChatsSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
  });

  Chats = mongoose.model('Chats', ChatsSchema);
}

export default Chats;
