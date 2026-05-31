const { JersApp_grp_members } = require("../model/Groups/member");
const { JersApp_Auth } = require("../model/auth");
const { CreateMember } = require("./member");

exports.AddMembersTOGroup = async (membersToBeAdded, userID, DB_Data) => {
  if (membersToBeAdded) {
    const AllMembers = await JersApp_grp_members.find({});
    membersToBeAdded.forEach(async (element) => {
      const MemberExit = AllMembers.find((i) => i.user_id == element);
      if (!MemberExit) {
        if (element == userID) {
          const isMemberCreated = await CreateMember(element, "ADMIN").then(
            (data) => data
          );
          if (isMemberCreated !== "error") {
            this.CheckMemberPresentInGroup(
              DB_Data.members,
              isMemberCreated._id
            );
          } else {
            return { status: "error", message: data.message };
          }
        } else {
          const isMemberCreated = await CreateMember(element, "MEMBER").then(
            (data) => data
          );
          if (isMemberCreated && isMemberCreated.status == "ok") {
            this.CheckMemberPresentInGroup(
              DB_Data.members,
              isMemberCreated._id
            );
          } else {
            return { status: "error", message: data.message };
          }
        }
      } else {
        this.CheckMemberPresentInGroup(DB_Data.members, MemberExit._id);
      }
    });
  } else {
    return { status: "error", message: "Members empty" };
  }
};
exports.CheckMemberPresentInGroup = async (Array, id) => {
  try {
    const isUserIdExists = Array.includes(id);
    if (!isUserIdExists) {
      DB_Data.Array.push(id);
      return { status: "ok", message: "Member added" };
    } else {
      return { status: "error", message: "Member already exists" };
    }
  } catch (error) {
    return { status: "error", message: error };
  }
};
exports.AddGroupIdToUser = async (groupID, UserIDs) => {
  try {
    if (groupID && UserIDs.length > 0) {
      let allSuccessful = true;

      for (const UserID of UserIDs) {
        const User = await JersApp_Auth.findById(UserID);
        if (User) {
          User.groups.push(groupID);
          const result = await User.save();
          if (!result) {
            allSuccessful = false;
          }
        } else {
          return {
            status: "error",
            message: `AddGroupIdToUser : Invalid UserID ${UserID}`,
          };
        }
      }

      if (allSuccessful) {
        return true;
      } else {
        return {
          status: "error",
          message: "Adding groupId to one or more users failed",
        };
      }
    } else {
      return { status: "error", message: "Err at linking group with user" };
    }
  } catch (error) {
    return { status: "error", message: `AddGroupIdToUser: ${error.message}` };
  }
};

exports.RemoveGroupFromEveryUser = async (allUsers, IDs) => {
  try {
    for (let user of allUsers) {
      const newGroups = user.groups.filter((group) => {
        const groupIdString = group.toHexString();
        return !IDs.map((id) => id.toHexString()).includes(groupIdString);
      });
      user.groups = newGroups;
      await user.save();
    }
    return true;
  } catch (error) {
    console.error("Error saving users:", "RemoveGroupFromEveryUser");
    return false;
  }
};
