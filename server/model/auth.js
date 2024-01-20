const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  mobNum: {type: String, unique: true},
  password: String,
  name: String,
});
const Auth = mongoose.model('Auth', authSchema);
exports.Auth = Auth;
