const mongoose = require("mongoose");

const jersAppConfigSchema = new mongoose.Schema({
  apkUrl: {
    type: String,
    required: false,
    default: "",
  },
});

exports.JersApp_Config = mongoose.model("JersApp_Config", jersAppConfigSchema);
