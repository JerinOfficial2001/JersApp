const express = require('express');
const app = express();
app.use(express.json());
const mongoose = require('mongoose');
const cors = require('cors');
app.use(cors());
const dotenv = require('dotenv');
dotenv.config();
const Auth = require('./routes/auth');
const Contact = require('./routes/contact');
const Chat = require('./routes/chat');
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('SERVER STARTED');
});
const MONGO = process.env.MONGODB;

mongoose.connect(MONGO).then(res => console.log('DB CONNECTED'));
app.use('/api/auth', Auth);
app.use('/api/contact', Contact);
app.use('/api/chat', Chat);
