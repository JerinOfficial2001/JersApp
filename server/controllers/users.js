const { JersApp_Auth } = require("../model/auth");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Use bcryptjs if installed, otherwise fall back to plain comparison
// Run: npm install bcryptjs --save
let bcrypt;
try {
  bcrypt = require("bcryptjs");
} catch (e) {
  console.warn(
    "[WARNING] bcryptjs not installed. Passwords stored/compared as plain text. Run: npm install bcryptjs --save"
  );
}

const SECRET_KEY = process.env.SECRET_KEY;
const SALT_ROUNDS = 10;

/** Hash a password if bcrypt is available, otherwise return plain */
const hashPassword = async (plain) => {
  if (bcrypt) return bcrypt.hash(plain, SALT_ROUNDS);
  return plain;
};

/** Compare password — supports both hashed (bcrypt) and legacy plain text */
const comparePassword = async (plain, stored) => {
  if (bcrypt) {
    // If stored value starts with bcrypt prefix it's hashed; otherwise plain
    const isBcryptHash = stored && stored.startsWith("$2");
    if (isBcryptHash) return bcrypt.compare(plain, stored);
  }
  // Legacy plain text comparison (will be phased out once all users have logged in)
  return plain === stored;
};

exports.getUsers = async (req, res, next) => {
  try {
    const allData = await JersApp_Auth.find({}, "-password");
    res.status(200).json({ status: "ok", data: allData });
  } catch (error) {
    console.error("getUsers Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.GetUsersByID = async (req, res, next) => {
  try {
    const User = await JersApp_Auth.findById(req.params.id, "-password");
    if (User) {
      res.status(200).json({ status: "ok", data: User });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.error("GetUsersByID Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { mobNum, password } = req.body;
    if (!mobNum || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Phone number and password are required" });
    }

    const user = await JersApp_Auth.findOne({ mobNum });
    if (!user) {
      return res.status(200).json({ status: "error", message: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ status: "error", message: "Invalid credentials" });
    }

    // Upgrade plain-text password to hashed on first successful login
    if (bcrypt && user.password && !user.password.startsWith("$2")) {
      user.password = await bcrypt.hash(password, SALT_ROUNDS);
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1w" });

    // Return full user profile so frontend can store it directly
    const userObj = user.toObject();
    delete userObj.password;
    userObj.accessToken = token;

    res.status(200).json({ status: "ok", data: userObj });
  } catch (error) {
    console.error("login Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.register = async (req, res, next) => {
  try {
    const { mobNum, password, name } = req.body;

    if (!mobNum || !password || !name) {
      if (req.file) DeleteLocalFile(`profile/${req.file.filename}`);
      return res
        .status(400)
        .json({ status: "error", message: "Name, phone number and password are required" });
    }

    // Use findOne instead of loading all users
    const existing = await JersApp_Auth.findOne({ mobNum });
    if (existing) {
      if (req.file) DeleteLocalFile(`profile/${req.file.filename}`);
      return res.status(400).json({ status: "error", message: "User Already Exists" });
    }

    const hashedPassword = await hashPassword(password);

    const userData = {
      mobNum,
      password: hashedPassword,
      name,
      theme: "JersApp",
    };

    if (req.file) {
      userData.image = {
        url: `${req.protocol}://${req.get("host")}/jersapp/uploads/profile/${req.file.filename}`,
        public_id: `profile/${req.file.filename}`,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      };
    }

    const savedUser = await JersApp_Auth.create(userData);
    if (savedUser) {
      const userObj = savedUser.toObject();
      delete userObj.password;
      res.status(201).json({ status: "ok", data: userObj });
    } else {
      if (req.file) DeleteLocalFile(`profile/${req.file.filename}`);
      res.status(400).json({ status: "error", message: "Registration failed" });
    }
  } catch (error) {
    if (req.file) DeleteLocalFile(`profile/${req.file.filename}`);
    console.error("register Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.userData = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorized - Missing token" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await JersApp_Auth.findById(decoded.userId, "-password");

    if (user) {
      const userObj = user.toObject();
      userObj.accessToken = token;
      res.status(200).json({ status: "ok", data: userObj });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ status: "error", message: "Token expired" });
    }
    res.status(401).json({ status: "error", message: "Unauthorized - Invalid token" });
  }
};

exports.logout = async (req, res) => {
  // Stateless JWT — just acknowledge the logout; client clears storage
  res.status(200).json({ status: "ok", message: "Logged out successfully" });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { mobNum, password, name, theme } = req.body;
    const userDatas = await JersApp_Auth.findById(req.params.id);
    if (!userDatas) {
      if (req.file) DeleteLocalFile(`profile/${req.file.filename}`);
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    if (req.body.isDeleteImg === "true" || req.body.isDeleteImg === true) {
      if (userDatas.image && userDatas.image.public_id) {
        DeleteLocalFile(userDatas.image.public_id);
      }
      req.body.image = null;
    }

    const updateData = {
      name: name || userDatas.name,
      mobNum: mobNum || userDatas.mobNum,
      theme: theme || userDatas.theme,
      image: req.file
        ? {
            url: `${req.protocol}://${req.get("host")}/jersapp/uploads/profile/${req.file.filename}`,
            public_id: `profile/${req.file.filename}`,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
            size: req.file.size,
          }
        : req.body.isDeleteImg === "true"
        ? null
        : userDatas.image,
    };

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (req.file && userDatas.image && userDatas.image.public_id) {
      DeleteLocalFile(userDatas.image.public_id);
    }

    const savedUser = await JersApp_Auth.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      select: "-password",
    });

    if (savedUser) {
      res.status(200).json({
        status: "ok",
        data: savedUser,
        message: "Profile updated successfully",
      });
    } else {
      if (req.file) DeleteLocalFile(`profile/${req.file.filename}`);
      res.status(400).json({ status: "error", message: "Update failed" });
    }
  } catch (error) {
    if (req.file) DeleteLocalFile(`profile/${req.file.filename}`);
    console.error("updateProfile Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const result = await JersApp_Auth.findByIdAndUpdate(
      req.params.id,
      { theme: req.body.theme },
      { new: true, select: "-password" }
    );
    if (result) {
      res.status(200).json({ status: "ok", message: "Theme updated successfully" });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.error("updateTheme Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const DeleteLocalFile = (public_id) => {
  if (!public_id) return;
  try {
    const safePath = path.normalize(public_id).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(__dirname, "../uploads", safePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting local file ${public_id}:`, error.message);
  }
};

exports.DeleteLocalFile = DeleteLocalFile;

exports.GetUsersByIDs = async (req, res, next) => {
  try {
    // Accept both { ids: [...] } and directly [...] from body
    const userIds = Array.isArray(req.body) ? req.body : req.body.ids;
    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ status: "error", message: "No IDs provided" });
    }

    const users = await JersApp_Auth.find({ _id: { $in: userIds } }, "-password");
    if (users.length > 0) {
      res.status(200).json({ status: "ok", data: users });
    } else {
      res.status(200).json({ status: "error", message: "No users found" });
    }
  } catch (error) {
    console.error("GetUsersByIDs Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
