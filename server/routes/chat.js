const express = require('express');
const {addChat} = require('../controllers/chat');
const {getChatByID} = require('../controllers/chat');

const router = express.Router();

router.post('/add', addChat);
router.get('/get/:user_id/:receiver_id', getChatByID);
module.exports = router;
