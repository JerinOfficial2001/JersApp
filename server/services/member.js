const { JersApp_grp_members } = require("../model/Groups/member");
const { JersApp_Auth } = require("../model/auth");

exports.CreateMember = async (id, role) => {
  try {
    // const IsUserExist = await JersApp_Auth.findById(id);
    // if (IsUserExist) {
    const result = await JersApp_grp_members.create({
      user_id: id,
      role,
    });
    if (result) {
      return { status: "ok", data: result };
    } else {
      return { status: "error", message: "Member creation failed" };
    }
    // } else {
    //   return { status: "ok", message: "User ID invalid" };
    // }
  } catch (error) {
    console.log(error, "CreateMember");
    return { status: "error", message: "CreateMemberService" };
  }
};
exports.CreateArrayOfMember = async (Array, userID) => {
  try {
    var Members = [];
    if (Array.length > 0) {
      const allUsers = await JersApp_Auth.find({});
      const ArrayOfIDs = allUsers
        .map((i) => i._id.toHexString())
        .filter((i) => Array.includes(i));

      if (ArrayOfIDs && ArrayOfIDs.length > 0) {
        for (const i of ArrayOfIDs) {
          const IsMemberExist = await JersApp_grp_members.findOne({
            user_id: i,
          });

          // if (!IsMemberExist) {
          try {
            const result = await JersApp_grp_members.create({
              user_id: i,
              role: "MEMBER",
            });
            Members.push(result._id);
          } catch (error) {
            return { status: "error", message: "Member creation failed" };
          }
          // } else {
          //   Members.push(IsMemberExist._id);
          // }
        }
        if (Members) {
          return { status: "ok", data: Members };
        } else {
          return { status: "error", message: "Empty" };
        }
      } else {
        return { status: "error", message: "Empty" };
      }
    } else {
      return { status: "error", message: "Main Empty" };
    }
  } catch (error) {
    return { status: "error", message: "CreateArrayOfMemberService" };
  }
};
exports.GetUserIdOfMember = async (id) => {
  try {
    if (id) {
      const memberUserID = await JersApp_grp_members.findById(id);
      if (memberUserID) {
        return { status: "ok", data: memberUserID._id };
      } else {
        return { status: "error", message: "Member not found" };
      }
    } else {
      return { status: "error", message: "Invalid Member ID" };
    }
  } catch (error) {
    return { status: "error", message: "CreateArrayOfMember" };
  }
};
