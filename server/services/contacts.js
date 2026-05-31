const { JersApp_Contact } = require("../model/contacts");
const { getImage } = require("./auth");

exports.getContactByUserID = async (id, currentUserID) => {
  try {
    const contact = await JersApp_Contact.findOne({
      user_id: id,
      creator_id: currentUserID,
    });
    const image = await getImage(id);
    const obj = { ...contact._doc, image };
    return obj;
  } catch (error) {
    console.log("getContact service failed");
  }
};
