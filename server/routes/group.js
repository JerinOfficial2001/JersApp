const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const { uploadGroup } = require("../middleware/upload");
const {
  createGroup,
  getAllGroups,
  deleteAllGroups,
  getGroups,
  getGroupById,
  updateGroup,
} = require("../controllers/Groups/groups");

router.post("/creategroup", authenticateJWT, uploadGroup.single("image"), createGroup);
router.get("/getAllgroups", authenticateJWT, getAllGroups);
router.get("/getGroups", authenticateJWT, getGroups);
router.get("/getgroupbyid/:id", authenticateJWT, getGroupById);
router.put("/updategroup/:id", authenticateJWT, uploadGroup.single("image"), updateGroup);
router.delete("/deleteAllgroups", authenticateJWT, deleteAllGroups);

module.exports = router;
