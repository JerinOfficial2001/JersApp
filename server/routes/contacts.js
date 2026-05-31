const express = require("express");
const {
  getContacts,
  addContacts,
  deleteContacts,
  deleteChat,
  AddAndGetAllContacts,
  getChats,
  getContactsByID,
} = require("../controllers/contacts");
const authenticateJWT = require("../middleware/auth");
const route = express.Router();

route.get("/contact", authenticateJWT, getContacts);
route.get("/contact/:id", authenticateJWT, getContactsByID);
route.get("/chats", authenticateJWT, getChats);
route.post("/contact", authenticateJWT, addContacts);
route.post("/addAndGetAllContacts", authenticateJWT, AddAndGetAllContacts);
route.delete("/contact", authenticateJWT, deleteContacts);
route.delete("/chat", authenticateJWT, deleteChat);

module.exports = route;

