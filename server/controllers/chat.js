const {Chat} = require('../model/chat');
const express = require('express');
const app = express();
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);

const io = socketIo(server);
exports.addChat = async (req, res, next) => {
  try {
    const {from, to, text} = req.body;
    const message = new Chat({username: from, message: text});
    await message.save();

    io.to(to).emit('privateMessage', {...message.toObject(), from});
    io.to(from).emit('privateMessage', {...message.toObject(), from});

    res.json({success: true});
  } catch (error) {
    res.status(500).json({error: 'Internal Server Error'});
  }
};

exports.getChatByUserName = async (req, res, next) => {
  try {
    const messages = await Chat.find().sort({createdAt: 'asc'});
    res.json(messages);
  } catch (error) {
    next(error);
  }
};
