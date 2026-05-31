const express = require("express");
const { getChat, createChat } = require("../controllers/chat");
const authenticateJWT = require("../middleware/auth");
const route = express.Router();

route.get("/", authenticateJWT, getChat);
route.post("/", authenticateJWT, createChat);

module.exports = route;
