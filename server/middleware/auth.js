const jwt = require("jsonwebtoken");
const { JersApp_Auth } = require("../model/auth");
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: "error", message: "Unauthorized: Missing Authorization Header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorized: Missing token" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await JersApp_Auth.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ status: "error", message: "Unauthorized: User does not exist" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Auth Middleware Error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ status: "error", message: "Unauthorized: Token has expired" });
    }
    return res.status(401).json({ status: "error", message: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticateJWT;
