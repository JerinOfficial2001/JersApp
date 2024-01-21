const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  user_id: String,
  ContactDetails: {type: Object, unique: true},
  name: String,
});
const Contact = mongoose.model('Contact', ContactSchema);
exports.Contact = Contact;
