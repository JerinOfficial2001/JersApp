const express = require("express");
const { getApkUrl, updateApkUrl } = require("../controllers/config");
const route = express.Router();

route.get("/apk", getApkUrl);
route.post("/apk", updateApkUrl);

module.exports = route;
