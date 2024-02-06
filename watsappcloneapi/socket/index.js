const mongoose = require('mongoose');
const express = require('express');
const  { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const cors = require('cors');
app.use(cors());
const {Message} = require('./model/message');
require('dotenv').config();
const db = process.env.MONGO_DB;
mongoose.connect(db).then(() => {
  console.log('DB Connected');
});
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const io =new Server(httpServer, {
  cors: {
    origin: "https://next-api-ruby.vercel.app",
 }

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
