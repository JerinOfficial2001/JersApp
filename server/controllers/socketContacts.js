const { JersApp_Contact } = require("../model/contacts");
const { JersApp_Auth } = require("../model/auth");

const getAllcontacts = async (id) => {
  try {
    const user = await JersApp_Auth.findById(id);
    if (!user) return [];
    if (!user.contacts) {
      user.contacts = [];
      await user.save();
    }
    const userContacts = await user.populate("contacts");
    return userContacts.contacts;
  } catch (error) {
    console.error("Error getting all contacts:", error.message);
    return [];
  }
};

exports.AddContacts = async (data) => {
  const { userID, id, msg } = data;
  try {
    const user = await JersApp_Auth.findById(userID);
    const senderData = await JersApp_Auth.findById(id);
    if (!user || !senderData) return false;

    const allContacts = await getAllcontacts(userID);
    const contact = allContacts.find((elem) => elem.user_id && elem.user_id.toString() === id.toString());

    if (!contact) {
      const createdContact = await JersApp_Contact.create({
        given_name: "",
        user_id: senderData._id,
        creator_id: user._id,
        phone: senderData.mobNum,
        name: senderData.name,
        lastMsg: msg,
      });
      user.contacts.push(createdContact._id);
      if (!user.chats) {
        user.chats = [];
      }
      user.chats.push(createdContact._id);
      await user.save();
      return true;
    } else {
      const chatIds = user.chats.map((elem) => elem.toString());
      if (!chatIds.includes(contact._id.toString())) {
        user.chats.push(contact._id);
        contact.lastMsg = msg;
        await contact.save();
        await user.save();
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.error("Error at adding socket contact:", error.message);
    return false;
  }
};

exports.UpdateLastMsg = async (ID1, ID2, msg) => {
  try {
    if (!ID1 || !ID2) return;
    const auth1 = await JersApp_Auth.findById(ID1).populate("contacts");
    const auth2 = await JersApp_Auth.findById(ID2).populate("contacts");
    if (!auth1 || !auth2) return;

    const contact1 = auth1.contacts.find((elem) => elem.user_id && elem.user_id.toString() === ID2.toString());
    const contact2 = auth2.contacts.find((elem) => elem.user_id && elem.user_id.toString() === ID1.toString());

    if (contact1) {
      contact1.lastMsg = msg;
      await contact1.save();
    }
    if (contact2) {
      contact2.lastMsg = msg;
      await contact2.save();
    }
  } catch (error) {
    console.error("Error updating last message:", error.message);
  }
};

exports.UpdateMsgCount = async (id, count) => {
  try {
    if (id) {
      const contact = await JersApp_Contact.findById(id);
      if (contact) {
        contact.msgCount = count;
        await contact.save();
      }
    }
  } catch (error) {
    console.error("Error updating msg count:", error.message);
  }
};
