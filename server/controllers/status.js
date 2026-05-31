const mongoose = require("mongoose");
const { JersApp_Auth } = require("../model/auth");
const { JersApp_status } = require("../model/status");
const { DeleteLocalFile } = require("./users");
const BASE_URL = process.env.BASE_URL;
exports.getAllStatus = async (req, res, next) => {
  const user_id = req.query.userID;
  if (!user_id || user_id === "undefined" || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(200).json({ status: "ok", data: [] });
  }
  try {
    const allContacts = await JersApp_Auth.findById(user_id).populate(
      "contacts"
    );
    const contacts = allContacts.contacts;
    const allData = await JersApp_status.find({});
    const stories = allData.map((elem) => {
      const isExist = contacts.some((i) => i.user_id == elem.userID);
      if (isExist) {
        if (isExist.userID == user_id) {
          return { ...elem.toObject(), isCreator: true };
        } else {
          return { ...elem.toObject(), isCreator: false };
        }
      }
    });
    if (stories) {
      // console.log(BASE_URL);
      const DATA = stories.map((elem) => ({
        ...elem,
        file: elem.file.map((img) => ({
          format: img.format,
          url: img.url,
          public_id: img.public_id,
        })),
      }));

      res.status(200).json({ status: "ok", data: DATA });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getStatusByID = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid status ID" });
    }
    const allData = await JersApp_status.findById(req.params.id);
    if (allData) {
      const DATA = {
        _id: allData._id,
        userID: allData.userID,
        userName: allData.userName,
        text: allData.text,
        file: allData.file.map((img) => ({
          format: img.format,
          url: img.url,
        })),
      };
      res.status(200).json({ status: "ok", data: DATA });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.addStatus = async (req, res, next) => {
  const { userID, text } = req.body;
  if (!userID || userID === "undefined" || !mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ status: "error", message: "Invalid user ID" });
  }
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400).json({ status: "error", message: "No data found" });
    } else {
      const userStatus = await JersApp_status.findOne({ userID });
      const userData = await JersApp_Auth.findById(userID);
      const AddFile = (file) => ({
        url: `${req.protocol}://${req.get("host")}/uploads/status/${file.filename}`,
        public_id: `status/${file.filename}`,
        format: file.mimetype,
        originalname: file.originalname,
        size: file.size,
      });
      if (userStatus && userData) {
        userStatus.file = userStatus.file.concat(
          req.files.map((file) => AddFile(file))
        );
        userStatus.userName = userData.name;
        const result = await userStatus.save();
        if (result) {
          res.status(200).json({ status: "ok", message: "Status Updated" });
        } else {
          if (req.files) {
            req.files.forEach((file) => DeleteLocalFile(`status/${file.filename}`));
          }
          res
            .status(400)
            .json({ status: "error", message: "Failed to Update Status" });
        }
      } else {
        // If user data doesn't exist, create a new document
        const newVal = new JersApp_status({
          userID,
          text,
          file: req.files.map((file) => AddFile(file)),
          userName: userData?.name,
        });
        const result = await newVal.save();
        if (result) {
          res.status(200).json({ status: "ok", message: "Status Posted" });
        } else {
          if (req.files) {
            req.files.forEach((file) => DeleteLocalFile(`status/${file.filename}`));
          }
          res
            .status(400)
            .json({ status: "error", message: "Failed to Post Status" });
        }
      }
    }
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => DeleteLocalFile(`status/${file.filename}`));
    }
    console.log(error);
    res.status(500).json({ status: "error", message: error.message || "Internal Server Error" });
  }
};
exports.deleteStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid status ID" });
    }
    const status = await JersApp_status.findById(req.params.id);
    if (status) {
      if (status.file && Array.isArray(status.file)) {
        for (const fileObj of status.file) {
          if (fileObj.public_id) {
            DeleteLocalFile(fileObj.public_id);
          }
        }
      }
      const result = await JersApp_status.findByIdAndDelete(req.params.id);
      if (result) {
        res.status(200).json({ status: "ok", message: "Status Deleted" });
      } else {
        res
          .status(400)
          .json({ status: "error", message: "Status not deleted" });
      }
    } else {
      res.status(404).json({ status: "error", message: "Status not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.deleteOldRecordsAndImages = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const oldRecords = await JersApp_status.find({
      createdAt: { $lt: twentyFourHoursAgo },
    });

    for (const record of oldRecords) {
      if (record.file && Array.isArray(record.file)) {
        for (const img of record.file) {
          if (img.public_id) {
            DeleteLocalFile(img.public_id);
          }
        }
      }
      await JersApp_status.deleteOne({ _id: record._id });
      console.log(`Document with ID ${record._id} deleted from MongoDB.`);
    }
  } catch (error) {
    console.log("Expired Status Deletion Error: ", error);
  }
};
