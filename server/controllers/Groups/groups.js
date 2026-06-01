const { JersApp_Group } = require("../../model/Groups/group");
const { JersApp_grp_members } = require("../../model/Groups/member");
const { JersApp_Auth } = require("../../model/auth");
const {
  AddMembersTOGroup,
  AddGroupIdToUser,
  RemoveGroupFromEveryUser,
} = require("../../services/groups");
const { CreateMember, CreateArrayOfMember } = require("../../services/member");
const { authenticateByTokenAndUserID } = require("../../utils/Authentication");
const { DeleteLocalFile } = require("../users");

exports.createGroup = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  let members = req.body.members;
  // if (!Array.isArray(members)) {
  //   members = [members];
  // }
  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const GroupAdmin = await CreateMember(UserData._id, "ADMIN").then(
          (data) => data
        );
        if (!GroupAdmin) {
          res
            .status(200)
            .json({ status: "error", message: "Error at adding ADMIN" });
        } else if (GroupAdmin.status == "error") {
          res.status(200).json({ status: "error", data: GroupAdmin.message });
        } else {
          const newMembers = await CreateArrayOfMember(
            members,
            UserData._id
          ).then((data) => data);
          if (!newMembers) {
            res
              .status(200)
              .json({ status: "error", message: "Error at adding members" });
          } else if (newMembers && newMembers.status == "error") {
            res.status(200).json({ status: "error", data: newMembers.message });
          } else {
            const result = new JersApp_Group({
              group_name: req.body.group_name,
              image: req.file
                ? {
                    url: `${req.protocol}://${req.get("host")}/jersapp/uploads/group/${req.file.filename}`,
                    public_id: `group/${req.file.filename}`,
                    mimetype: req.file.mimetype,
                    originalname: req.file.originalname,
                    size: req.file.size,
                  }
                : req.body.image,
              last_msg: req.body.last_msg,
              unread_msg: req.body.unread_msg,
              created_by: UserData.name,
              members: [],
            });
            if (result) {
              UserData.groups.push(result._id);
              const IsComplete = await UserData.save();
              if (IsComplete) {
                result.members = [GroupAdmin.data._id, ...newMembers.data];
                const IsGrpAdded = await result.save();

                if (IsGrpAdded) {
                  const IsGrpIdAddedToUser = await AddGroupIdToUser(
                    IsGrpAdded._id,
                    members
                  ).then((data) => data);
                  if (IsGrpIdAddedToUser && !IsGrpIdAddedToUser.message) {
                    res.status(200).json({
                      status: "ok",
                      message: "Group created successfully",
                    });
                  } else {
                    res.status(200).json({
                      status: "error",
                      message: "Error Occured While Adding GroupID to User",
                    });
                  }
                } else {
                  if (req.file) {
                    DeleteLocalFile(`group/${req.file.filename}`);
                  }
                  res.status(400).json({
                    status: "error",
                    message: "Creating group failed",
                  });
                }
              } else {
                res.status(200).json({
                  status: "error",
                  message: "Group Linking User failed",
                });
              }
            } else {
            }
          }
        }
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    if (req.file) {
      DeleteLocalFile(`group/${req.file.filename}`);
    }
    next(error);
  }
};
exports.getAllGroups = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const allGroups = await JersApp_Group.find({});
        res.status(200).json({ status: "ok", data: allGroups });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.deleteAllGroups = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      const allGroup = await JersApp_Group.find({});
      const IDs = allGroup.map((i) => i._id);
      const allUsers = await JersApp_Auth.find({});
      const IsGroupRemoved = await RemoveGroupFromEveryUser(allUsers, IDs).then(
        (data) => data
      );
      if (IsGroupRemoved) {
        const deletedGroups = await JersApp_Group.deleteMany();
        res.status(200).json({ status: "ok", message: deletedGroups });
      } else {
        res.status(200).json({
          status: "error",
          message: "Group deletion failed while removing from user",
        });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.getGroups = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const User = await JersApp_Auth.findById(userID).populate({
          path: "groups",
          populate: {
            path: "messages",
            select: "sender_id msg fileType deletedForEveryone readBy createdAt"
          }
        });
        
        const validGroups = User.groups.filter(g => g != null);
        const processedGroups = validGroups.map(group => {
           let lastMsg = null;
           let unreadCount = 0;
           // Filter out any null messages (e.g. if a message was deleted directly from the DB)
           const validMessages = group.messages ? group.messages.filter(m => m != null && m.sender_id) : [];
           
           if (validMessages.length > 0) {
              const sortedMessages = [...validMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
              const actualLastMsg = sortedMessages[sortedMessages.length - 1];
              if (actualLastMsg) {
                 lastMsg = {
                    name: actualLastMsg.sender_id.toString() === userID ? "You" : "Member",
                    msg: actualLastMsg.deletedForEveryone ? "🚫 This message was deleted" : (actualLastMsg.fileType ? `📷 ${actualLastMsg.fileType}` : actualLastMsg.msg),
                    fileType: actualLastMsg.fileType,
                 };
              }
              // Count unread
              unreadCount = sortedMessages.filter(m => m.sender_id.toString() !== userID && m.readBy && !m.readBy.includes(userID)).length;
           }
           
           return {
              ...group.toObject(),
              last_msg: lastMsg,
              unread_msg: unreadCount,
              messages: validMessages.map(m => m._id) // Don't send all messages back
           };
        });

        res.status(200).json({ status: "ok", data: processedGroups });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.getGroupById = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const group = await JersApp_Group.findById(req.params.id);
        res.status(200).json({ status: "ok", data: group });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.updateGroup = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const group = await JersApp_Group.findById(req.params.id);
        if (group) {
          if (req.body.group_name) {
            group.group_name = req.body.group_name;
          }
          if (req.file) {
            if (group.image && group.image.public_id) {
              DeleteLocalFile(group.image.public_id);
            }
            group.image = {
              url: `${req.protocol}://${req.get("host")}/jersapp/uploads/group/${req.file.filename}`,
              public_id: `group/${req.file.filename}`,
              mimetype: req.file.mimetype,
              originalname: req.file.originalname,
              size: req.file.size,
            };
          } else if (req.body.isDeleteImg === "true" || req.body.isDeleteImg === true) {
            if (group.image && group.image.public_id) {
              DeleteLocalFile(group.image.public_id);
            }
            group.image = null;
          }
          const result = await group.save();
          if (result) {
            res.status(200).json({ status: "ok", data: result, message: "Updated" });
          } else {
            if (req.file) {
              DeleteLocalFile(`group/${req.file.filename}`);
            }
            res.status(400).json({ status: "error", message: "Failed" });
          }
        } else {
          if (req.file) {
            DeleteLocalFile(`group/${req.file.filename}`);
          }
          res.status(404).json({ status: "error", message: "Group not found" });
        }
      } else {
        if (req.file) {
          DeleteLocalFile(`group/${req.file.filename}`);
        }
        res.status(404).json({ status: "error", message: "User not found" });
      }
    } else {
      if (req.file) {
        DeleteLocalFile(`group/${req.file.filename}`);
      }
      res.status(401).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    if (req.file) {
      DeleteLocalFile(`group/${req.file.filename}`);
    }
    next(error);
  }
};
