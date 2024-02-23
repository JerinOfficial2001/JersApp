import connectToDatabase from "@/api/lib/db";
import Message from "@/api/model/message";
import { Server } from "socket.io";

export default async function SocketHandler(req, res) {
  await connectToDatabase();

  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server, { path: "/api/socket" });
  res.socket.server.io = io;
  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("message", async (obj) => {
      await Message.create(obj);
      const allData = await Message.find({});
      io.emit("message", allData);
    });
    socket.on("disconnect", () => {
      console.log("User Disconnected");
    });
  });

  // console.log("Setting up socket");
  res.end();
}
