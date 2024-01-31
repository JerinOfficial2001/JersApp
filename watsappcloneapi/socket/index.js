const mongoose = require('mongoose');
const {Message} = require('./model/message');
require('dotenv').config();
const db = process.env.MONGO_DB;
mongoose.connect(db).then(() => {
  console.log('DB Connected');
});
const socketAPI = process.env.SOCKET_API;
const io = require('socket.io')(4000, {
  cors: {
    origin: socketAPI,
    methods: ['GET', 'POST'],
  },
});
io.on('connection', socket => {
  console.log('User connected');
  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
  socket.on('message', async obj => {
    await Message.create(obj);
    const allData = await Message.find({});
    io.emit('message', allData);
  });
});
