import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { GET_LOCAL_STORAGE } from "./EncryptedCookies";
import { Socket_URL } from "@/api";
import { getUserNameByID } from "@/controllers/auth";
import { queryClient } from "./providers";
import toast from "react-hot-toast";

const SocketContext = createContext<any>({});
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";

  if (userAgent.indexOf("Edg") > -1) {
    browserName = "edge";
  } else if (userAgent.indexOf("Chrome") > -1) {
    browserName = "chrome";
  } else if (userAgent.indexOf("Firefox") > -1) {
    browserName = "firefox";
  } else if (userAgent.indexOf("Safari") > -1) {
    browserName = "safari";
  } else if (
    userAgent.indexOf("MSIE") > -1 ||
    userAgent.indexOf("Trident") > -1
  ) {
    browserName = "Internet Explorer";
  } else if (userAgent.indexOf("Edge") > -1) {
    browserName = "explorer";
  }

  return browserName;
};

export default function SocketProvider({ children }: any) {
  const [socket, setsocket] = useState<any>(null);
  const [socketID, setsocketID] = useState<any>(null);
  const [token, settoken] = useState("");
  const [activeUsers, setactiveUsers] = useState([]);
  const [isConnected, setisConnected] = useState(false);
  const [usersInGroup, setusersInGroup] = useState([]);
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  const [isWatching, setisWatching] = useState<any>(null);
  const [isTyping, setisTyping] = useState<any>(null);
  const [appSocketID, setappSocketID] = useState("");

  // LiveKit Call States
  const [callState, setCallState] = useState<"idle" | "calling" | "incoming" | "active">("idle");
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [activeCallPartner, setActiveCallPartner] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [offer, setoffer] = useState<any>(null);
  const [answer, setanswer] = useState<any>(null);

  const roomRef = useRef<any>(null);

  const cleanupCall = async () => {
    try {
      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }
    } catch (e) {
      console.error("Error disconnecting room:", e);
    }
    setLocalStream((prev) => {
      if (prev) {
        prev.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
    setRemoteStream(null);
    setCallState("idle");
    setIncomingCall(null);
    setActiveCallPartner(null);
    setIsMuted(false);
    setIsVideoMuted(false);
    setRoomName(null);
  };

  const startCall = async (partnerId: string, audioOnly: boolean = false) => {
    try {
      setIsAudioOnly(audioOnly);
      setActiveCallPartner(partnerId);
      setCallState("calling");

      const generatedRoom = `room_${userData?._id}_${partnerId}_${Date.now()}`;
      setRoomName(generatedRoom);

      // Fetch LiveKit token
      const response = await fetch(`/jersapp/get-token?roomName=${generatedRoom}&participantName=${userData?._id}`);
      const resData = await response.json();
      const token = resData.token;

      const { Room, RoomEvent } = await import("livekit-client");
      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: any) => {
        if (track.kind === "video") {
          const stream = new MediaStream([track.mediaStreamTrack]);
          setRemoteStream(stream);
        } else if (track.kind === "audio") {
          const stream = new MediaStream([track.mediaStreamTrack]);
          setRemoteStream(prev => {
            if (prev) {
              prev.addTrack(track.mediaStreamTrack);
              return new MediaStream(prev.getTracks());
            }
            return stream;
          });
        }
      });

      await room.connect("wss://livekit.codefam.fun", token);
      await room.localParticipant.enableCameraAndMicrophone();

      // Retrieve local streams
      const localVideoTrack = room.localParticipant.videoTrackPublications.values().next().value?.track;
      const localAudioTrack = room.localParticipant.audioTrackPublications.values().next().value?.track;
      
      const tracks = [];
      if (localVideoTrack?.mediaStreamTrack) tracks.push(localVideoTrack.mediaStreamTrack);
      if (localAudioTrack?.mediaStreamTrack) tracks.push(localAudioTrack.mediaStreamTrack);
      if (tracks.length > 0) {
        setLocalStream(new MediaStream(tracks));
      }

      socket?.emit("offer", {
        to: partnerId,
        from: userData?._id,
        name: userData?.name || userData?.userName,
        roomName: generatedRoom,
        isAudioOnly: audioOnly,
      });

    } catch (error: any) {
      console.error("Error starting call:", error);
      cleanupCall();
      toast.error(error?.message || "Could not access camera/microphone");
    }
  };

  const acceptCall = async () => {
    if (!incomingCall || !roomName) return;
    try {
      setCallState("active");

      // Fetch LiveKit token
      const response = await fetch(`/jersapp/get-token?roomName=${roomName}&participantName=${userData?._id}`);
      const resData = await response.json();
      const token = resData.token;

      const { Room, RoomEvent } = await import("livekit-client");
      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: any) => {
        if (track.kind === "video") {
          const stream = new MediaStream([track.mediaStreamTrack]);
          setRemoteStream(stream);
        } else if (track.kind === "audio") {
          const stream = new MediaStream([track.mediaStreamTrack]);
          setRemoteStream(prev => {
            if (prev) {
              prev.addTrack(track.mediaStreamTrack);
              return new MediaStream(prev.getTracks());
            }
            return stream;
          });
        }
      });

      await room.connect("wss://livekit.codefam.fun", token);
      await room.localParticipant.enableCameraAndMicrophone();

      // Retrieve local streams
      const localVideoTrack = room.localParticipant.videoTrackPublications.values().next().value?.track;
      const localAudioTrack = room.localParticipant.audioTrackPublications.values().next().value?.track;
      
      const tracks = [];
      if (localVideoTrack?.mediaStreamTrack) tracks.push(localVideoTrack.mediaStreamTrack);
      if (localAudioTrack?.mediaStreamTrack) tracks.push(localAudioTrack.mediaStreamTrack);
      if (tracks.length > 0) {
        setLocalStream(new MediaStream(tracks));
      }

      socket?.emit("answer", {
        to: incomingCall.from,
        from: userData?._id,
      });

    } catch (error) {
      console.error("Error accepting call:", error);
      cleanupCall();
      toast.error("Could not access camera/microphone");
    }
  };

  const declineCall = () => {
    if (activeCallPartner) {
      socket?.emit("callend", {
        to: activeCallPartner,
        from: userData?._id,
      });
    }
    cleanupCall();
  };

  const endCall = () => {
    if (activeCallPartner) {
      socket?.emit("callend", {
        to: activeCallPartner,
        from: userData?._id,
      });
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (roomRef.current) {
      const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
      roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
      setIsMuted(enabled);
    }
  };

  const toggleVideo = () => {
    if (roomRef.current) {
      const enabled = roomRef.current.localParticipant.isCameraEnabled;
      roomRef.current.localParticipant.setCameraEnabled(!enabled);
      setIsVideoMuted(enabled);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const connection = io(Socket_URL || "", {
      path: "/jersapp/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });
    setsocket(connection);
    connection.on("connect", () => {
      setsocketID(connection?.id);
      if (userData) {
        toast.success("Online");
        connection.emit("me", userData._id);
        connection.emit("set_user_id", userData._id);
        connection.emit("user_connected", {
          id: userData._id,
          status: "online",
        });
      }
      setisConnected(true);
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    });
    connection.on("disconnect", () => {
      setisConnected(false);
      toast.error("offline");
    });
    connection.on("webAuthToken", (data) => {
      settoken(data.token);
      setappSocketID(data.socket_id);
    });
    connection.on("user_connected", (data) => {
      setactiveUsers(data);
    });
    connection.on("user_watching", (data) => {
      setisWatching(data);
    });
    connection.on("user_typing", (data) => {
      setisTyping(data);
    });
    connection.on("message", (data) => {
      queryClient.invalidateQueries({ queryKey: ["message"] });
    });
    connection.on("newMessage", (data) => {
      queryClient.invalidateQueries({ queryKey: ["message"] });
    });

    // WebRTC connection listeners
    connection.on("offer", async (data) => {
      setIncomingCall(data);
      setRoomName(data.roomName);
      setCallState("incoming");
      setActiveCallPartner(data.from);
      setIsAudioOnly(data.isAudioOnly || false);

      if (document.visibilityState !== "visible" && "Notification" in window) {
        try {
          const user = await getUserNameByID(data.from);
          const name = user?.name || user?.userName || "Someone";
          const title = `Incoming ${data.isAudioOnly ? "Audio" : "Video"} Call`;
          const body = `${name} is calling you...`;

          if (Notification.permission === "granted") {
            new Notification(title, { body, tag: "incoming-call" });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification(title, { body, tag: "incoming-call" });
              }
            });
          }
        } catch (err) {
          console.error("Error displaying call notification:", err);
        }
      }
    });
    connection.on("answer", (data) => {
      setCallState("active");
    });
    connection.on("callend", () => {
      cleanupCall();
    });

    connection.on("new_group_msg", () => {
      queryClient.invalidateQueries({ queryKey: ["grpmessages"] });
    });
    connection.on("userInGroup", (data) => {
      setusersInGroup(data);
    });
    connection.on("notification", (data) => {
      queryClient.invalidateQueries({ queryKey: ["message"] });

      if ("Notification" in window && document.visibilityState !== "visible") {
        try {
          const senderName = data.name || "New Message";
          const messageBody = data.msg || "Sent a message";

          if (Notification.permission === "granted") {
            new Notification(senderName, {
              body: messageBody,
              tag: "new-message",
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification(senderName, {
                  body: messageBody,
                  tag: "new-message",
                });
              }
            });
          }
        } catch (err) {
          console.error("Error displaying msg notification:", err);
        }
      }
    });
    return () => {
      if (connection) {
        connection.disconnect();
        setisConnected(false);
      }
    };
  }, []);

  const handleAuthSuccess = (id: any, data: any) => {
    const browser_name = getBrowserName();
    socket?.emit("authenticated", {
      userID: id,
      session_data: {
        imageType: browser_name,
        socket_id: socketID,
      },
      id: appSocketID,
    });
  };
  const handleSendMsg = (data: any) => {
    socket?.emit("message", data);
  };

  const socketUserID = (data: any) => {
    socket?.emit("set_user_id", data);
    socket?.emit("me", data);
  };
  const socketRommID = (data: any) => {
    socket?.emit("roomID", data);
  };
  const socketUserConnected = (data: any) => {
    socket?.emit("user_connected", data);
  };
  const socketUserWatching = (data: any) => {
    socket?.emit("user_watching", data);
  };
  const socketUserTyping = (data: any) => {
    socket?.emit("user_typing", data);
  };
  const socketUserTyped = (data: any) => {
    socket?.emit("user_typed", data);
  };
  const socketUserWatched = (data: any) => {
    socket?.emit("user_watchout", data);
  };
  const socketLogout = () => {
    socket?.emit("removeUser", userData?._id);
  };
  const socketJoinGroup = (data: any) => {
    socket?.emit("join_group", data);
  };
  const socketRemoveGroup = (data: any) => {
    socket?.emit("remove_group", data);
  };
  const socketSendGroupMsg = (data: any) => {
    socket?.emit("send_group_msg", data);
  };
  const socketUpdateRole = (data: any) => {
    socket?.emit("update_role", data);
  };
  const socketRemoveMember = (data: any) => {
    socket?.emit("remove_member", data);
  };
  const socketAddMember = (data: any) => {
    socket?.emit("add_member", data);
  };
  const socketJoinUserVcall = (data: any) => {
    socket?.emit("videocall", JSON.stringify({ sdp: data }));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketID,
        token,
        activeUsers,
        setactiveUsers,
        handleAuthSuccess,
        handleSendMsg,
        isConnected,
        socketRommID,
        socketSendGroupMsg,
        socketJoinGroup,
        socketRemoveGroup,
        usersInGroup,
        setusersInGroup,
        isWatching,
        setisWatching,
        isTyping,
        setisTyping,
        socketUserWatching,
        socketUserWatched,
        socketUserTyping,
        socketUserTyped,
        socketUserID,
        offer,
        setoffer,
        answer,
        setanswer,
        // WebRTC calling exports
        callState,
        incomingCall,
        isAudioOnly,
        activeCallPartner,
        localStream,
        remoteStream,
        isMuted,
        isVideoMuted,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideo,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
