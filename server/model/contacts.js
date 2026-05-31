const mongoose = require("mongoose");
const JersApp_ContactSchema = new mongoose.Schema(
  {
    phone: Number,
    name: String,
    user_id: String,
    ContactDetails: Object,
    lastMsg: Object,
    msgCount: Number,
    given_name: String,
    creator_id: String,
  },
  {
    timestamps: true,
  }
);

const JersApp_Contact = mongoose.model(
  "JersApp_Contact",
  JersApp_ContactSchema
);
exports.JersApp_Contact = JersApp_Contact;
