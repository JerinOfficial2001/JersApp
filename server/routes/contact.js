const express = require('express');
const {addContact} = require('../controllers/contact');
const {getContactByID} = require('../controllers/contact');
const router = express.Router();

router.post('/add', addContact);
router.get('/get/:id', getContactByID);
module.exports = router;
