const { JersApp_Group } = require("../../model/Groups/group");
const { JersApp_grp_members } = require("../../model/Groups/member");
const { JersApp_Auth } = require("../../model/auth");
const { CreateMember } = require("../../services/member");
const { authenticateByTokenAndUserID } = require("../../utils/Authentication");

exports.DeleteAllMembers = async (req, res) => {
  try {
    const result = await JersApp_grp_members.deleteMany();
    res.status(200).json({ status: "ok", data: result });
  } catch (error) {
    console.log("DeleteAllMembers", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
exports.getAllMembers = async (req, res) => {
  try {
    const result = await JersApp_grp_members.find({});
    res.status(200).json({ status: "ok", data: result });
  } catch (error) {
    console.log("getAllMembers", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
exports.GetMembersByGroupID = async (req, res, next) => {
  const { groupID } = req.query;
  try {
    const AllMembers = await JersApp_Group.findById(groupID).populate(
      "members"
    );
    if (!AllMembers) {
      return res.status(404).json({ status: "error", message: "Group not found" });
    }

    let Members = [];
    for (let member of AllMembers.members) {
      const user = await JersApp_Auth.findById(member.user_id);
      if (user) {
        const { _id, ...userWithoutId } = user.toObject();
        Members.push(Object.assign({}, member.toObject(), userWithoutId));
      } else {
        console.error(`User with ID ${member.user_id} not found.`);
      }
    }

    res.status(200).json({ status: "ok", data: Members });
  } catch (error) {
    console.log("GetMembersByGroupID", error);
    next(error);
  }
};
exports.AddMembersToGroup = async (req, res, next) => {
  const { groupID } = req.query;
  try {
    const Group = await JersApp_Group.findById(groupID);
    const membersToAdd = req.body.members;
    if (!membersToAdd || membersToAdd.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Members Empty",
      });
    }
    if (Group) {
      const AllUsers = await JersApp_Auth.find({});
      const UserIDs = AllUsers.map((i) => i._id.toHexString());
      const memberUserIDsInGroup = await Promise.all(
        Group.members.map(async (member) => {
          try {
            const memberUserID = await JersApp_grp_members.findById(
              member
            );
            return memberUserID ? memberUserID.user_id : null;
          } catch (error) {
            console.error(
              `Error fetching member with ID ${member}:`,
              error
            );
            return null;
          }
        })
      );
      const verifiedUsersToAdd = membersToAdd.filter((i) => {
        return !memberUserIDsInGroup.includes(i.user_id);
      });

      if (verifiedUsersToAdd.length !== 0) {
        await Promise.all(
          verifiedUsersToAdd.map(async (i) => {
            if (UserIDs.includes(i.user_id)) {
              const IsCreated = await CreateMember(
                i.user_id,
                i.role
              );
              if (IsCreated.status == "ok") {
                Group.members.push(IsCreated.data._id);
                const UserData = await JersApp_Auth.findById(i.user_id);
                UserData.groups.push(groupID);
                await UserData.save();
              }
            }
          })
        );
        await Group.save();
        res.status(200).json({ status: "ok", message: "User added" });
      } else {
        res.status(400).json({
          status: "error",
          message: "Users already in this group",
        });
      }
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Group not found" });
    }
  } catch (error) {
    console.log("AddMembersToGroup", error);
    next(error);
  }
};
exports.RemoveMemberFromGroup = async (req, res, next) => {
  const { groupID } = req.query;
  const UserToRemove = req.params.id;
  try {
    if (!UserToRemove) {
      return res.status(400).json({
        status: "error",
        message: "Member not selected",
      });
    }
    const Group = await JersApp_Group.findById(groupID);
    if (Group) {
      const Member = await JersApp_grp_members.findByIdAndDelete(
        UserToRemove
      );
      if (Member) {
        Group.members = Group.members.filter((i) => i != UserToRemove);
        const IsRemoved = await Group.save();
        if (IsRemoved) {
          res.status(200).json({
            status: "ok",
            message: "User Removed successfully",
          });
        } else {
          res.status(400).json({
            status: "error",
            message: "Member not removed",
          });
        }
      } else {
        res.status(404).json({
          status: "error",
          message: "Member not found",
        });
      }
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Group not found" });
    }
  } catch (error) {
    console.log("RemoveMemberFromGroup", error);
    next(error);
  }
};
exports.UpdateMember = async (req, res) => {
  const memberID = req.params.id;
  try {
    const memberData = await JersApp_grp_members.findById(memberID);
    if (memberData) {
      memberData.role = req.body.role;
      const result = await memberData.save();
      if (result) {
        res
          .status(200)
          .json({ status: "ok", data: "Updated successfully" });
      } else {
        res
          .status(400)
          .json({ status: "error", message: "Updation failed" });
      }
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Member not found" });
    }
  } catch (error) {
    console.log("UpdateMember Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
