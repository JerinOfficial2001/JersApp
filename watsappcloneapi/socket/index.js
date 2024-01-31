const mongoose = require('mongoose');
const {Message} = require('./model/message');
require('dotenv').config();
const db = process.env.MONGO_DB;
mongoose.connect(db).then(() => {
  console.log('DB Connected');
});
const io = require('socket.io')(4000, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
io.on('connection', socket => {
  console.log('connected');
  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
  socket.on('message', async obj => {
    await Message.create(obj);
    const allData = await Message.find({});
    io.emit('message', allData);
  });
});
