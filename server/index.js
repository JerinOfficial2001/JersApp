require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { randomUUID } = require("crypto");
const cron = require("node-cron");
const path = require("path");

const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const frontendPath = path.resolve(__dirname, "../web");
const nextApp = next({ dev, dir: frontendPath });
const handle = nextApp.getRequestHandler();

const BASE_PATH = "/jersapp";

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const httpServer = createServer(app);
const cors = require("cors");
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : "*";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
const logger = require("./middleware/logger");
app.use(logger);
const db = process.env.MONGO_DB;
mongoose.connect(db)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
//*Routes
const Messages = require("./routes/message");
const Auth = require("./routes/users");
const Contacts = require("./routes/contacts");
const Status = require("./routes/status");
const Groups = require("./routes/group");
const Members = require("./routes/member");
const Chats = require("./routes/chats");
const { deleteOldRecordsAndImages } = require("./controllers/status");

// Socket imports and controllers
const { JersApp_Message } = require("./model/message");
const { JersApp_grp_message } = require("./model/Groups/message");
const { JersApp_Group } = require("./model/Groups/group");
const { VChat_Auth } = require("./model/Vchat_Auth");
const {
  RemoveUser,
  AddUser,
  GetOtherUsers,
  GetUser,
  GetRoomID,
  CreateRoom,
} = require("./controllers/roomID");
const {
  UpdateLastMsg,
  AddContacts,
  UpdateMsgCount,
} = require("./controllers/socketContacts");

app.get(`${BASE_PATH}/health`, (req, res) => {
  res.status(200).json({ status: "ok", message: "Socket Server is running" });
});

app.get(`${BASE_PATH}/api`, (req, res) => {
  res.status(200).json({ status: "ok", message: "JersApp API is running 🚀" });
});

app.use(`${BASE_PATH}/api`, Messages);
app.use(`${BASE_PATH}/api/auth`, Auth);
app.use(`${BASE_PATH}/api`, Contacts);
app.use(`${BASE_PATH}/api/status`, Status);
app.use(`${BASE_PATH}/api/group`, Groups);
app.use(`${BASE_PATH}/api/member`, Members);
app.use(`${BASE_PATH}/api/chat`, Chats);
app.use(`${BASE_PATH}/uploads`, express.static(path.join(__dirname, "uploads")));

// VChat API endpoints
app.post(`${BASE_PATH}/vChat/auth`, async (req, res) => {
  try {
    const user = await VChat_Auth.findOne({ email: req.body.email });
    if (!user) {
      const result = await VChat_Auth.create(req.body);
      if (result) {
        res.status(200).json({ status: "ok", data: result });
      } else {
        res
          .status(400)
          .json({ status: "error", message: "something went wrong" });
      }
    } else {
      res.status(200).json({ status: "ok", data: user });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message || error });
  }
});

app.get(`${BASE_PATH}/create-room`, async (req, res) => {
  try {
    const roomID = randomUUID();
    res.json({ roomID });
    await CreateRoom(roomID);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get(`${BASE_PATH}/get-token`, async (req, res) => {
  try {
    const { roomName, participantName } = req.query;
    if (!roomName || !participantName) {
      return res.status(400).json({ error: "Missing roomName or participantName" });
    }
    const { createToken } = require("./livekitHelper");
    const token = await createToken(roomName, participantName);
    res.json({ token });
  } catch (err) {
    console.error("Error creating token:", err);
    res.status(500).json({ error: err.message });
  }
});


cron.schedule("* * * * *", () => {
  deleteOldRecordsAndImages();
});

// Socket Servers Initializations
const io = new Server(httpServer, {
  path: `${BASE_PATH}/socket.io`,
  transports: ["polling", "websocket"],
  cors: {
    origin: corsOrigin,
  },
});
const ioVchat = new Server(httpServer, {
  path: `${BASE_PATH}/vchat`,
  transports: ["polling", "websocket"],
  cors: {
    origin: corsOrigin,
  },
});
const ioGroupVchat = new Server(httpServer, {
  path: `${BASE_PATH}/groupvchat`,
  transports: ["polling", "websocket"],
  cors: {
    origin: corsOrigin,
  },
});
const ioJersFolio = new Server(httpServer, {
  path: `${BASE_PATH}/jersfolio`,
  transports: ["polling", "websocket"],
  cors: {
    origin: corsOrigin,
  },
});

let activeUsers = [];
let newMsgs = {};
let usersInGroup = {};
let webSessions = {};
let watchingUsers = {};

//* JersApp Socket Events
io.on("connection", async (socket) => {
  try {
    const groups = await JersApp_Group.find({});
    const groupIds = groups.map((elem) => elem._id.toHexString());
    if (groupIds && groupIds.length > 0) {
      for (let id of groupIds) {
        socket.join(id);
      }
    }
  } catch (err) {
    console.error("Error joining group rooms:", err.message);
  }

  socket.on("me", (id) => {
    socket.join(id);
  });

  socket.on("offer", (data) => {
    socket.to(data.to).emit("offer", {
      from: data.from,
      offer: data.offer,
      localStream: data.localStream,
      name: data.name,
      roomName: data.roomName,
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.to).emit("answer", {
      from: data.from,
      answer: data.answer,
      remoteStream: data.remoteStream,
    });
  });

  socket.on("icecandidate", (data) => {
    socket.to(data.to).emit("icecandidate", {
      from: data.from,
      candidate: data.candidate,
    });
  });

  socket.on("callend", (data) => {
    socket.to(data.to).emit("callend", {
      state: true,
    });
  });

  socket.on("roomID", (id) => {
    socket.join(id);
  });

  socket.on("webAuthToken", (obj) => {
    io.to(obj.id).emit("webAuthToken", obj);
  });

  socket.on("authenticated", (obj) => {
    if (!webSessions[obj.userID]) {
      webSessions[obj.userID] = [];
    }
    webSessions[obj.userID].push(obj.session_data);
    io.to(obj.id).emit("authenticated", webSessions[obj.userID]);
  });

  socket.on("webAuthLogout", (obj) => {
    if (webSessions[obj.userID]) {
      const filteredArr = webSessions[obj.userID].filter(
        (elem) => elem.socket_id != obj.socket_id
      );
      webSessions[obj.userID] = filteredArr;
    }
    io.to(obj.id).emit("authenticated", webSessions[obj.userID] || []);
  });

  socket.on("set_user_id", (userId) => {
    socket.userId = userId;
  });

  socket.on("message", async (obj) => {
    try {
      let chatID = obj.chatID;
      if (!chatID || chatID.includes("_") || !mongoose.Types.ObjectId.isValid(chatID)) {
        let chat = await JersApp_Chats.findOne({
          $or: [
            { sender: obj.sender, receiver: obj.receiver },
            { sender: obj.receiver, receiver: obj.sender },
          ],
        });
        if (!chat) {
          chat = await JersApp_Chats.create({
            sender: obj.sender,
            receiver: obj.receiver,
          });
        }
        chatID = chat._id.toString();
      }

      const isReceiverOnline = activeUsers.some((u) => u.id === obj.receiver);
      const initialStatus = isReceiverOnline ? "delivered" : "sent";

      // Save the new message to DB
      const newMsg = new JersApp_Message({
        chatID: chatID,
        sender: obj.sender,
        receiver: obj.receiver,
        message: obj.message,
        status: initialStatus,
        fileUrl: obj.fileUrl || null,
        fileType: obj.fileType || null,
      });
      const savedMsg = await newMsg.save();

      // Emit only the new message to the chat room (NOT all messages)
      const msgPayload = {
        ...savedMsg.toObject(),
        name: obj.name,
        Contact_id: obj.Contact_id,
        chatID: chatID,
        status: initialStatus,
        fileUrl: obj.fileUrl || null,
        fileType: obj.fileType || null,
      };
      socket.to(chatID).emit("newMessage", msgPayload);
      // Also emit to sender's socket for confirmation
      socket.emit("newMessage", msgPayload);

      // Notify receiver
      socket
        .to(obj.receiver)
        .emit("notification", { msg: obj.message, name: obj.name });

      // Add receiver to sender's chats/contacts
      await AddContacts({
        userID: obj.sender,
        id: obj.receiver,
        contact_id: obj.Contact_id,
        msg: { id: obj.sender, msg: obj.message },
      });

      // Add sender to receiver's chats/contacts
      const isAdded = await AddContacts({
        userID: obj.receiver,
        id: obj.sender,
        contact_id: obj.Contact_id,
        msg: { id: obj.sender, msg: obj.message },
      });
      if (!isAdded) {
        await UpdateLastMsg(obj.sender, obj.receiver, {
          id: obj.sender,
          msg: obj.message,
        });
      } else {
        socket.to(obj.receiver).emit("Contact", true);
      }

      if (!newMsgs[obj.receiver]) {
        newMsgs[obj.receiver] = [];
      }
      newMsgs[obj.receiver].push({ id: obj.receiver, msg: obj.message });
      socket.to(obj.receiver).emit("newMsgs", {
        lastMsg: { msg: obj.message, id: obj.receiver },
        count: newMsgs[obj.receiver].length,
      });
      await UpdateMsgCount(obj.Contact_id, newMsgs[obj.receiver].length);
    } catch (err) {
      console.error("Error in socket message:", err.message);
    }
  });

  socket.on("clearNewMsg", async ({ id, Contact_id }) => {
    try {
      newMsgs[id] = [];
      socket.to(id).emit("newMsgs", { count: 0, lastMsg: "" });
      await UpdateMsgCount(Contact_id, "0");
    } catch (err) {
      console.error("Error in clearNewMsg:", err.message);
    }
  });

  socket.on("mark_as_read", async ({ chatID, userID }) => {
    try {
      if (!chatID || !userID) return;
      await JersApp_Message.updateMany(
        { chatID, receiver: userID, status: { $ne: "read" } },
        { $set: { status: "read" } }
      );
      socket.to(chatID).emit("messages_read", { chatID, userID });
    } catch (err) {
      console.error("Error in mark_as_read:", err.message);
    }
  });

  socket.on("user_connected", async (obj) => {
    const alreadyActiveIndex = activeUsers.findIndex(
      (user) => user.id == obj.id
    );
    if (alreadyActiveIndex !== -1) {
      activeUsers[alreadyActiveIndex].status = "online";
    } else {
      obj.status = "online";
      obj.socket = socket.userId;
      activeUsers.push(obj);
    }
    io.emit("user_connected", activeUsers);

    try {
      await JersApp_Message.updateMany(
        { receiver: obj.id, status: "sent" },
        { $set: { status: "delivered" } }
      );
      io.emit("messages_delivered", { receiver: obj.id });
    } catch (err) {
      console.error("Error updating messages to delivered:", err.message);
    }
  });

  socket.on("user_watching", (obj) => {
    if (!obj.id || !obj.receiverId) return;
    watchingUsers[obj.id] = obj.receiverId;

    // Notify the receiver that this user is watching
    io.to(obj.receiverId).emit("user_watching", { isWatching: true, id: obj.id });

    // If the receiver is also already watching the sender, notify the sender as well
    if (watchingUsers[obj.receiverId] === obj.id) {
      io.to(obj.id).emit("user_watching", { isWatching: true, id: obj.receiverId });
    }
  });

  socket.on("user_watchout", (obj) => {
    if (!obj.id) return;
    delete watchingUsers[obj.id];
    io.to(obj.receiverId).emit("user_watching", { isWatching: false, id: obj.id });
  });

  socket.on("user_typing", (obj) => {
    socket
      .to(obj.receiverId)
      .emit("user_typing", { isTyping: true, id: obj.id });
  });

  socket.on("user_typed", (obj) => {
    socket
      .to(obj.receiverId)
      .emit("user_typing", { isTyping: false, id: obj.id });
  });

  socket.on("removeUser", (id) => {
    const currentArr = activeUsers.filter((user) => user.id !== id);
    activeUsers = currentArr;
    io.emit("user_connected", activeUsers);
    socket.leave(id);
  });

  //* Group Socket
  socket.on("send_group_msg", async (obj) => {
    try {
      const newMsg = new JersApp_grp_message({
        group_id: obj.group_id,
        sender_id: obj.sender_id,
        msg: obj.msg,
      });
      const result = await newMsg.save();
      if (result) {
        const group = await JersApp_Group.findById(obj.group_id);
        if (group) {
          group.messages.push(result._id);
          const isAdded = await group.save();
          if (isAdded) {
            socket.to(obj.group_id).emit("new_group_msg", obj);
          }
        }
      }
    } catch (error) {
      console.error("send_group_msg Error:", error.message);
    }
  });

  socket.on("join_group", (obj) => {
    if (!usersInGroup[obj.groupID]) {
      usersInGroup[obj.groupID] = [];
    }
    if (!usersInGroup[obj.groupID].includes(obj.userID)) {
      usersInGroup[obj.groupID].push(obj);
    }
    io.to(obj.groupID).emit("userInGroup", usersInGroup[obj.groupID]);
  });

  socket.on("remove_group", (obj) => {
    if (usersInGroup[obj.groupID]) {
      const users = usersInGroup[obj.groupID].filter(
        (elem) => elem.userID != obj.userID
      );
      usersInGroup[obj.groupID] = users;
    }
    io.to(obj.groupID).emit("userInGroup", usersInGroup[obj.groupID] || []);
  });

  socket.on("add_member", (obj) => {
    io.to(obj.groupID).emit("role_updation_result", {
      response: true,
      groupID: obj,
    });
  });

  socket.on("update_role", (obj) => {
    io.to(obj.groupID).emit("role_updation_result", {
      response: true,
      groupID: obj.groupID,
    });
  });

  socket.on("remove_member", (obj) => {
    io.to(obj.groupID).emit("role_updation_result", {
      response: true,
      groupID: obj.groupID,
    });
  });

  socket.on("disconnect", () => {
    const disconnectedUserId = socket.userId;
    if (disconnectedUserId) {
      delete watchingUsers[disconnectedUserId];
      const currentArr = activeUsers.filter(
        (user) => user.id !== disconnectedUserId
      );
      activeUsers = currentArr;
      io.emit("user_connected", activeUsers);
    }
  });
});

//* VChat Solo Socket Events
ioVchat.on("connection", (socket) => {
  socket.on("me", (id) => {
    socket.join(id);
    ioVchat.to(id).emit("me", id);
  });
  socket.on("callUser", (data) => {
    ioVchat.to(data.userToCall).emit("callUser", {
      from: data.from,
      signal: data.signalData,
      name: data.name,
    });
  });
  socket.on("answerCall", (data) => {
    ioVchat.to(data.to).emit("callAccepted", data.signal);
  });
  socket.on("callEnded", (data) => {
    ioVchat.emit("callEnded", data);
  });
});

//* Group VChat Socket Events
ioGroupVchat.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
  });
  socket.on("user-toggle-audio", (userId, roomId) => {
    socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
  });
  socket.on("user-toggle-video", (userId, roomId) => {
    socket.broadcast.to(roomId).emit("user-toggle-video", userId);
  });
  socket.on("user-leave", (userId, roomId) => {
    socket.broadcast.to(roomId).emit("user-leave", userId);
  });
});

//* JersFolio Socket Events
ioJersFolio.on("connection", (socket) => {
  socket.on("sendmessage", (obj) => {
    ioJersFolio.emit("receivemessage", {
      status: "ok",
      message: "Message Send",
    });
  });
});

// Let Next.js handle everything else
app.all("*", (req, res) => handle(req, res));

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.message);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// Start server after Next.js is prepared
const PORT = process.env.PORT || 9709;
nextApp.prepare().then(() => {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
