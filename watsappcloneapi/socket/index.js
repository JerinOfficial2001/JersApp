const mongoose = require('mongoose');
const express = require('express');
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const app = express();
const cors = require('cors');
app.use(cors());

const {Message} = require('./model/message');
require('dotenv').config();
const db = process.env.MONGO_DB;
mongoose.connect(db).then(() => {
  console.log('DB Connected');
});
const PORT = process.env.PORT || 4000;
const io = new Server(httpServer, {
  cors: {
    origin: *,
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
