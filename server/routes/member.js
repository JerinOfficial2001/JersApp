const express = require("express");
const {
  DeleteAllMembers,
  getAllMembers,
  GetMembersByGroupID,
  AddMembersToGroup,
  RemoveMemberFromGroup,
  UpdateMember,
} = require("../controllers/Groups/members");
const authenticateJWT = require("../middleware/auth");
const router = express.Router();

router.get("/getAllMembers", authenticateJWT, getAllMembers);
router.get("/getMembers", authenticateJWT, GetMembersByGroupID);
router.post("/createmember", authenticateJWT, AddMembersToGroup);
router.delete("/deleteAllMembers", authenticateJWT, DeleteAllMembers);
router.delete("/removeMember/:id", authenticateJWT, RemoveMemberFromGroup);
router.put("/updateMember/:id", authenticateJWT, UpdateMember);

module.exports = router;
