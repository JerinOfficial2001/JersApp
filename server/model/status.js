const mongoose = require("mongoose");
const JersApp_statusSchema = new mongoose.Schema(
  {
    text: String,
    // video: { type: Object },
    file: { type: Array },
    userID: String,
    userName: String,
    createdAt: { type: Date, default: Date.now, expires: "24h" },
  },
  { timestamps: true }
);

const JersApp_status = mongoose.model("JersApp_status", JersApp_statusSchema);
exports.JersApp_status = JersApp_status;
