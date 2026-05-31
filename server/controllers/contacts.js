const { JersApp_Auth } = require("../model/auth");
const { JersApp_Chats } = require("../model/chats");
const { JersApp_Contact } = require("../model/contacts");
const { JersApp_Message } = require("../model/message");

exports.addContacts = async (req, res, next) => {
  const { userID } = req.query;
  try {
    if (req.user._id.toString() !== userID) {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: You cannot modify this user's contacts" });
    }
    const contact = await JersApp_Contact.findById(req.body.id);
    const user = await JersApp_Auth.findById(userID, "chats");
    if (!userID || !contact) {
      return res
        .status(400)
        .json({ status: "error", message: "UserId or contact undefined" });
    }

    const chatIds = user.chats.map((elem) => elem.toString());
    if (!chatIds.includes(req.body.id)) {
      user.chats.push(contact._id);
      await user.save();
      res.status(200).json({ status: "ok", data: contact });
    } else {
      res.status(200).json({
        status: "error",
        message: "already registered",
        data: contact.user_id,
      });
    }
  } catch (error) {
    console.error("addContacts Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.getContacts = async (req, res, next) => {
  const { user_id } = req.query;
  try {
    if (req.user._id.toString() !== user_id) {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: You cannot access this user's contacts" });
    }
    const allContacts = await JersApp_Auth.findById(user_id).populate("contacts");
    const contacts = allContacts.contacts.filter((elem) => elem.user_id != user_id);
    const filteredData = await getImageByID(contacts);
    res.status(200).json({ status: "ok", data: filteredData });
  } catch (error) {
    console.error("getContacts Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.getContactsByID = async (req, res, next) => {
  const id = req.params.id;
  try {
    const contact = await JersApp_Contact.findById(id);
    res.status(200).json({ status: "ok", data: contact });
  } catch (error) {
    console.error("getContactsByID Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.getChats = async (req, res, next) => {
  const { user_id } = req.query;
  try {
    if (req.user._id.toString() !== user_id) {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: You cannot access this user's chats" });
    }

    // Auto-heal/sync chats list based on messages
    const user = await JersApp_Auth.findById(user_id);
    if (user) {
      const userContacts = await JersApp_Contact.find({ creator_id: user_id });
      const currentChatIds = new Set(user.chats.map((c) => c.toString()));
      let needsSave = false;

      for (const contact of userContacts) {
        if (contact.user_id && !currentChatIds.has(contact._id.toString())) {
          const chatRoom = await JersApp_Chats.findOne({
            $or: [
              { sender: user_id, receiver: contact.user_id },
              { sender: contact.user_id, receiver: user_id },
            ],
          });
          if (chatRoom) {
            const messageExists = await JersApp_Message.findOne({ chatID: chatRoom._id.toString() });
            if (messageExists) {
              user.chats.push(contact._id);
              currentChatIds.add(contact._id.toString());
              needsSave = true;
            }
          }
        }
      }
      if (needsSave) {
        await user.save();
      }
    }

    const allContacts = await JersApp_Auth.findById(user_id).populate("chats");
    const filteredData = await getImageByID(allContacts.chats);
    const userWithContacts = await JersApp_Auth.findById(user_id).populate("contacts");
    const allUserContacts = userWithContacts.contacts;
    const result = updateLastMsgNameByID(filteredData, user_id, allUserContacts);
    res.status(200).json({ status: "ok", data: result });
  } catch (error) {
    console.error("getChats Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.deleteContacts = async (req, res, next) => {
  const { sender_id, receiver_id, Contact_id } = req.query;
  try {
    if (req.user._id.toString() !== sender_id) {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: You cannot modify this user's contacts" });
    }
    const result = await JersApp_Contact.findOne({ _id: Contact_id });
    if (!result) {
      return res.status(200).json({ status: "ok", message: "failed" });
    }

    const filteredChats = await JersApp_Chats.findOne({
      $or: [
        { sender: sender_id, receiver: receiver_id },
        { sender: receiver_id, receiver: sender_id },
      ],
    });

    // Remove contact ref from sender's contacts and chats arrays
    await JersApp_Auth.findByIdAndUpdate(sender_id, {
      $pull: { contacts: result._id, chats: result._id },
    });

    await JersApp_Contact.findByIdAndDelete(result._id);

    if (filteredChats) {
      await JersApp_Message.deleteMany({ chatID: filteredChats._id });
      await JersApp_Chats.findByIdAndDelete(filteredChats._id);
      return res.status(200).json({ status: "ok", message: "Contact & chat & Msg Deleted" });
    }

    res.status(200).json({ status: "ok", message: "Contact Deleted" });
  } catch (error) {
    console.error("deleteContacts Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

/**
 * One-sided chat deletion:
 * Only removes the chat from the current user's chats list.
 * Does NOT delete the contact doc, shared chat room, or messages,
 * so the other user's chat and history remain untouched.
 * If the other user sends a new message, auto-heal in getChats will
 * re-add the chat to this user's list.
 */
exports.deleteChat = async (req, res, next) => {
  const { user_id, Contact_id } = req.query;
  try {
    if (req.user._id.toString() !== user_id) {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: You cannot modify this user's chats" });
    }

    const contact = await JersApp_Contact.findById(Contact_id);
    if (!contact) {
      return res.status(200).json({ status: "ok", message: "failed" });
    }

    // Only remove from this user's chats array (one-sided)
    await JersApp_Auth.findByIdAndUpdate(user_id, {
      $pull: { chats: contact._id },
    });

    // Reset lastMsg and msgCount on the contact doc so it doesn't show stale data
    await JersApp_Contact.findByIdAndUpdate(Contact_id, {
      $unset: { lastMsg: "", msgCount: "" },
    });

    // Find the chat room to clear messages for this user
    const chatRoom = await JersApp_Chats.findOne({
      $or: [
        { sender: user_id, receiver: contact.user_id },
        { sender: contact.user_id, receiver: user_id },
      ],
    });

    // Add user_id to the deletedFor array of all existing messages in this chat
    if (chatRoom) {
      await JersApp_Message.updateMany(
        { chatID: chatRoom._id.toString() },
        { $addToSet: { deletedFor: user_id } }
      );
    }

    res.status(200).json({ status: "ok", message: "Chat removed" });
  } catch (error) {
    console.error("deleteChat Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

/**
 * AddAndGetAllContacts:
 * Receives device contacts (name + phone), finds which ones are JersApp users,
 * creates JersApp_Contact records for new ones, returns the full list.
 */
exports.AddAndGetAllContacts = async (req, res, next) => {
  const { userID } = req.query;
  try {
    if (req.user._id.toString() !== userID) {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: You cannot access this user's contacts" });
    }

    const currentUser = req.user;
    if (!currentUser.contacts) currentUser.contacts = [];

    if (req.body.contacts && req.body.contacts.length > 0) {
      const deviceContacts = req.body.contacts;

      // Extract all phone numbers from device contacts
      const phoneNumbers = deviceContacts.map((c) => c.mobNum);

      // Find all JersApp users whose phone matches any device contact
      // Exclude the current user themselves
      const jersAppUsers = await JersApp_Auth.find(
        { mobNum: { $in: phoneNumbers }, _id: { $ne: currentUser._id } },
        "_id name mobNum image"
      );

      if (jersAppUsers.length > 0) {
        // Build a map: phone → jersAppUser
        const jersAppUserMap = {};
        jersAppUsers.forEach((u) => {
          jersAppUserMap[u.mobNum] = u;
        });

        // Find which contacts already exist in DB for this creator
        const existingContacts = await JersApp_Contact.find({
          creator_id: currentUser._id.toString(),
        });
        const existingUserIds = new Set(existingContacts.map((c) => c.user_id?.toString()));

        // Build list of contacts to create (only ones not already saved)
        const toCreate = [];
        deviceContacts.forEach((dc) => {
          const jersUser = jersAppUserMap[dc.mobNum];
          if (jersUser && !existingUserIds.has(jersUser._id.toString())) {
            toCreate.push({
              given_name: dc.givenName || "",
              user_id: jersUser._id.toString(),
              creator_id: currentUser._id.toString(),
              phone: dc.mobNum,
              name: dc.name || jersUser.name,
            });
          }
        });

        if (toCreate.length > 0) {
          const created = await JersApp_Contact.insertMany(toCreate);
          const newIds = created.map((c) => c._id);
          currentUser.contacts.push(...newIds);
          await currentUser.save();
        }
      }
    }

    // Return all contacts for this user, enriched with JersApp user image
    const userWithContacts = await JersApp_Auth.findById(userID).populate("contacts");
    const registeredContacts = await getImageByID(userWithContacts.contacts || []);

    const registeredPhones = new Set(
      registeredContacts.map((c) => c.phone?.toString())
    );

    const allContacts = [...registeredContacts];

    if (req.body.contacts && req.body.contacts.length > 0) {
      req.body.contacts.forEach((dc) => {
        if (dc.mobNum && !registeredPhones.has(dc.mobNum.toString())) {
          allContacts.push({
            name: dc.name || dc.givenName || "Unknown",
            given_name: dc.givenName || "",
            phone: dc.mobNum,
            isOnJersApp: false,
          });
        }
      });
    }

    res.status(200).json({ status: "ok", data: allContacts });
  } catch (error) {
    console.error("AddAndGetAllContacts Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

/**
 * Single $in query to fetch all user profile images in ONE DB round-trip.
 */
const getImageByID = async (arr) => {
  if (!arr || arr.length === 0) return [];

  const userIds = arr.map((obj) => obj.user_id).filter(Boolean);
  const users = await JersApp_Auth.find({ _id: { $in: userIds } }, "image name");

  const userMap = {};
  users.forEach((u) => {
    userMap[u._id.toString()] = u;
  });

  return arr.map((obj) => {
    const jersUser = userMap[obj.user_id?.toString()];
    return {
      ...obj.toObject(),
      image: jersUser?.image || null,
      isOnJersApp: !!jersUser,
      // Enrich with JersApp display name if available
      ContactDetails: jersUser
        ? { _id: jersUser._id, name: jersUser.name, image: jersUser.image }
        : null,
    };
  });
};

/**
 * Resolve last message sender name without extra DB queries.
 */
const updateLastMsgNameByID = (arr, id, allUserContacts) => {
  const contactMap = {};
  allUserContacts.forEach((c) => {
    contactMap[c.user_id?.toString()] = c;
  });

  return arr.map((contact) => {
    if (contact.lastMsg && contact.lastMsg.id) {
      if (contact.lastMsg.id == id) {
        contact.lastMsg["name"] = "You";
      } else {
        const senderContact = contactMap[contact.lastMsg.id?.toString()];
        contact.lastMsg["name"] = senderContact
          ? senderContact.given_name || senderContact.name || senderContact.phone
          : "Unknown";
      }
      delete contact.lastMsg.id;
    }
    return contact;
  });
};
