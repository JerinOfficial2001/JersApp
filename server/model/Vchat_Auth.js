const mongoose = require("mongoose");
const VChat_AuthSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    image: String,
  },
  {
    timestamps: true,
  }
);
const VChat_Auth = mongoose.model("VChat_Auth", VChat_AuthSchema);
exports.VChat_Auth = VChat_Auth;
