const { JersApp_Config } = require("../model/config");

exports.getApkUrl = async (req, res) => {
  try {
    const config = await JersApp_Config.findOne();
    if (config) {
      return res.status(200).json({ status: "ok", data: { apkUrl: config.apkUrl } });
    } else {
      return res.status(200).json({ status: "ok", data: { apkUrl: "" } });
    }
  } catch (error) {
    console.error("getApkUrl Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.updateApkUrl = async (req, res) => {
  try {
    const { apkUrl, adminKey } = req.body;
    if (adminKey !== "Admin@241323") {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    let config = await JersApp_Config.findOne();
    if (config) {
      config.apkUrl = apkUrl || "";
      await config.save();
    } else {
      config = new JersApp_Config({ apkUrl: apkUrl || "" });
      await config.save();
    }
    return res.status(200).json({ status: "ok", message: "APK URL updated successfully", data: config });
  } catch (error) {
    console.error("updateApkUrl Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
