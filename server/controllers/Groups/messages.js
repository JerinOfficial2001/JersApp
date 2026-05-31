const { JersApp_Auth } = require("../../model/auth");
const { JersApp_Group } = require("../../model/Groups/group");
const { JersApp_grp_message } = require("../../model/Groups/message");
const { getContactByUserID } = require("../../services/contacts");
const { authenticateByTokenAndUserID } = require("../../utils/Authentication");

exports.getMessages = async (req, res, next) => {
  const { userID, groupID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const group = await JersApp_Group.findById(groupID).populate(
          "messages"
        );

        if (group) {
          let messages = [];
          for (let msg of group.messages) {
            const user = await JersApp_Auth.findById(msg.sender_id);
            const contact = await getContactByUserID(msg.sender_id, userID);
            const { image, name, mobNum, ...otherDatas } = user.toObject();
            const newObj = Object.assign({}, msg.toObject(), {
              name,
              image,
              given_name: contact.given_name,
              phone: mobNum,
            });
            messages.push(newObj);
          }
          res.status(200).json({ status: "ok", data: messages });
        } else {
          res.status(200).json({ status: "error", message: "Group not found" });
        }
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("getMessages", error);
    next(error);
  }
};
