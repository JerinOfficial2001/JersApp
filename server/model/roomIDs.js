const mongoose = require("mongoose");
const VChat_RoomIDsSchema = new mongoose.Schema(
  {
    roomID: String,
    users: Array,
  },
  {
    timestamps: true,
  }
);
const VChat_RoomIDs = mongoose.model("VChat_RoomIDs", VChat_RoomIDsSchema);
exports.VChat_RoomIDs = VChat_RoomIDs;
