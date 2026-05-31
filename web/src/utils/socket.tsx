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

  // WebRTC States
  const [offer, setoffer] = useState<any>(null);
  const [answer, setanswer] = useState<any>(null);
  const [callState, setCallState] = useState<"idle" | "calling" | "incoming" | "active">("idle");
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [activeCallPartner, setActiveCallPartner] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueueRef = useRef<any[]>([]);

  const cleanupCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
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
    iceCandidatesQueueRef.current = [];
  };

  const startCall = async (partnerId: string, audioOnly: boolean = false) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera/microphone API is not supported. Please make sure you are using a secure connection (HTTPS or localhost).");
      }

      // Check which devices are actually connected
      let hasAudio = false;
      let hasVideo = false;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        hasAudio = devices.some((device) => device.kind === "audioinput");
        hasVideo = devices.some((device) => device.kind === "videoinput");
      } catch (e) {
        hasAudio = true;
        hasVideo = true;
      }

      if (!hasAudio && !hasVideo) {
        throw new Error("No camera or microphone detected. Please connect an input device (microphone/webcam) to make calls.");
      }

      const constraints: MediaStreamConstraints = {
        audio: hasAudio,
        video: !audioOnly && hasVideo,
      };

      if (!audioOnly && !hasVideo) {
        audioOnly = true;
        toast.error("No camera detected. Starting audio-only call.");
      }

      setIsAudioOnly(audioOnly);
      setActiveCallPartner(partnerId);
      setCallState("calling");

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          throw new Error("Specified recording device not found. Please connect your microphone/camera.");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          throw new Error("Permission denied. Please grant camera/microphone access in your browser settings.");
        } else {
          throw err;
        }
      }
      setLocalStream(stream);

      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("icecandidate", {
            from: userData?._id,
            to: partnerId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      const localOffer = await pc.createOffer();
      await pc.setLocalDescription(localOffer);

      socket?.emit("offer", {
        to: partnerId,
        offer: localOffer,
        from: userData?._id,
        isAudioOnly: audioOnly,
        name: userData?.name || userData?.userName,
      });
    } catch (error: any) {
      console.error("Error starting call:", error);
      cleanupCall();
      toast.error(error?.message || "Could not access camera/microphone");
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera/microphone API is not supported. Please make sure you are using a secure connection (HTTPS or localhost).");
      }

      // Check which devices are actually connected
      let hasAudio = false;
      let hasVideo = false;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        hasAudio = devices.some((device) => device.kind === "audioinput");
        hasVideo = devices.some((device) => device.kind === "videoinput");
      } catch (e) {
        hasAudio = true;
        hasVideo = true;
      }

      if (!hasAudio && !hasVideo) {
        throw new Error("No camera or microphone detected. Please connect an input device (microphone/webcam) to accept calls.");
      }

      const constraints: MediaStreamConstraints = {
        audio: hasAudio,
        video: !isAudioOnly && hasVideo,
      };

      if (!isAudioOnly && !hasVideo) {
        setIsAudioOnly(true);
        toast.error("No camera detected. Accepting as audio-only call.");
      }

      setCallState("active");
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          throw new Error("Specified recording device not found. Please connect your microphone/camera.");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          throw new Error("Permission denied. Please grant camera/microphone access in your browser settings.");
        } else {
          throw err;
        }
      }
      setLocalStream(stream);

      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("icecandidate", {
            from: userData?._id,
            to: incomingCall.from,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

      const localAnswer = await pc.createAnswer();
      await pc.setLocalDescription(localAnswer);

      socket?.emit("answer", {
        to: incomingCall.from,
        answer: localAnswer,
        from: userData?._id,
      });

      // Process queued ice candidates
      iceCandidatesQueueRef.current.forEach((candidate) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate))
          .catch((err) => console.error("Error adding queued candidate:", err));
      });
      iceCandidatesQueueRef.current = [];
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
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const connection = io(Socket_URL || "", {
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
      setoffer(data);
      setIncomingCall(data);
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
      setanswer(data);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
          .catch((err) => console.error("Error setting remote description:", err));
        setCallState("active");
      }
    });
    connection.on("icecandidate", (data) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch((err) => console.error("Error adding ice candidate:", err));
      } else {
        iceCandidatesQueueRef.current.push(data.candidate);
      }
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
