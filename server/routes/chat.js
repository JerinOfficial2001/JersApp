const express = require('express');
const {addChat} = require('../controllers/chat');
const {getChatByUserName} = require('../controllers/chat');

const router = express.Router();

router.post('/add', addChat);
router.get('/get', getChatByUserName);
module.exports = router;
