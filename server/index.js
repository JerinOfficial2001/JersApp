const express = require('express');
const app = express();
app.use(express.json());
const mongoose = require('mongoose');
const cors = require('cors');
app.use(cors());
const dotenv = require('dotenv');
dotenv.config();
const Auth = require('./routes/auth');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('SERVER STARTED');
});
const MONGO = process.env.MONGODB;

mongoose.connect(MONGO).then(res => console.log('DB CONNECTED'));
app.use('/api/auth', Auth);
