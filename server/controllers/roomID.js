const { VChat_RoomIDs } = require("../model/roomIDs");

exports.CreateRoom = async (roomID) => {
  try {
    const room = await VChat_RoomIDs.findOne({ roomID });
    if (!room) {
      await VChat_RoomIDs.create({ roomID, users: [] });
    }
  } catch (error) {
    console.error("Error creating room:", error.message);
  }
};

exports.RemoveUser = async (roomID, userID) => {
  try {
    const currentRoom = await VChat_RoomIDs.findOne({ roomID });
    if (!currentRoom) return;

    const userLength = currentRoom.users.length;
    if (userLength <= 1) {
      await VChat_RoomIDs.findByIdAndDelete(currentRoom._id);
    } else {
      const filteredUser = currentRoom.users.filter((i) => i.userID !== userID);
      await VChat_RoomIDs.findByIdAndUpdate(currentRoom._id, {
        roomID: currentRoom.roomID,
        users: filteredUser,
      });
    }
  } catch (error) {
    console.error("Error removing user from room:", error.message);
  }
};

exports.AddUser = async (roomID, data) => {
  try {
    const currentRoom = await VChat_RoomIDs.findOne({ roomID });
    if (currentRoom) {
      const userFound = currentRoom.users.some((i) => i.userID == data.userID);
      if (!userFound) {
        currentRoom.users.push(data);
        await VChat_RoomIDs.findByIdAndUpdate(currentRoom._id, {
          roomID: currentRoom.roomID,
          users: currentRoom.users,
        });
      }
    }
  } catch (error) {
    console.error("Error adding user to room:", error.message);
  }
};

exports.GetOtherUsers = async (roomID, userID) => {
  try {
    const currentRoom = await VChat_RoomIDs.findOne({ roomID });
    if (!currentRoom) return [];
    return currentRoom.users.filter((i) => i.userID !== userID);
  } catch (error) {
    console.error("Error getting other users:", error.message);
    return [];
  }
};

exports.GetUser = async (roomID, userID) => {
  try {
    const currentRoom = await VChat_RoomIDs.findOne({ roomID });
    if (!currentRoom) return null;
    return currentRoom.users.find((i) => i.userID == userID);
  } catch (error) {
    console.error("Error getting user from room:", error.message);
    return null;
  }
};

exports.GetRoomID = async (userID) => {
  try {
    const rooms = await VChat_RoomIDs.find({});
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      if (room.users && room.users.length !== 0) {
        const userFound = room.users.some((user) => user.userID == userID);
        if (userFound) {
          return room.roomID;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting room ID:", error.message);
    return null;
  }
};
