import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  PhoneCall,
  RefreshCw,
  Reply,
  ReplyAll,
  Send,
  Trash2,
  Video,
  Paperclip,
  Mic,
  Square,
} from "lucide-react";

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mail } from "../data";
import { addDays, addHours, format, nextSaturday } from "date-fns";
import Bubble from "@/components/chatComponents/Bubble";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMessage } from "@/controllers/chat";
import { POST } from "@/services/requests";
import Loader from "@/components/chatComponents/Loader";
import { useEffect, useRef, useState } from "react";
import { getTime, groupMessagesByDate } from "@/utils/Date&Time";
import { useSocket } from "@/utils/socket";
import { GET_UserData } from "@/utils/EncryptedCookies";
import { sendMsg } from "@/controllers/messages";
import { queryClient } from "@/utils/providers";
import toast from "react-hot-toast";
import { RemoveSfromName } from "@/utils/methods";
import { useGlobalContext } from "@/utils/globalContext";
import StoryCarosel from "@/components/chatComponents/StoryCarosel";
import { GetStatusByID } from "@/controllers/story";
import { getGroupMsg } from "@/controllers/groups";

interface MailDisplayProps {
  mail: any;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const userData = GET_UserData();
  const [inputData, setinputData] = useState("");
  const [realChatID, setRealChatID] = useState<string>("");
  const today = new Date();
  const {
    handleSendMsg,
    socketRommID,
    socketRemoveGroup,
    socketJoinGroup,
    socketSendGroupMsg,
    usersInGroup,
    setusersInGroup,
    socket,
    socketUserWatching,
    socketUserWatched,
    socketUserTyping,
    socketUserTyped,
    isWatching,
    setisWatching,
    isTyping,
    socketUserID,
    startCall,
  } = useSocket();
  const { title } = useGlobalContext();
  const scrollRef = useRef<any>();

  const isReceiverWatching = isWatching && isWatching.id === mail?.user_id && isWatching.isWatching;
  const isReceiverTyping = isTyping && isTyping.id === mail?.user_id && isTyping.isTyping;

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !realChatID) return;

    let fileType: "image" | "video" | "audio" | "document" = "document";
    if (file.type.startsWith("image/")) fileType = "image";
    else if (file.type.startsWith("video/")) fileType = "video";
    else if (file.type.startsWith("audio/")) fileType = "audio";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await POST("/api/message/upload", formData, true);
      if (response && response.status === "ok" && response.fileUrl) {
        handleSendMsg({
          chatID: realChatID,
          sender: userData._id,
          receiver: mail.user_id,
          message: `Sent a ${fileType}`,
          name: userData.name,
          fileUrl: response.fileUrl,
          fileType: fileType,
        });
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" });
        
        const formData = new FormData();
        formData.append("file", audioFile);

        try {
          const response = await POST("/api/message/upload", formData, true);
          if (response && response.status === "ok" && response.fileUrl) {
            handleSendMsg({
              chatID: realChatID,
              sender: userData._id,
              receiver: mail.user_id,
              message: "Voice note",
              name: userData.name,
              fileUrl: response.fileUrl,
              fileType: "audio",
            });
          }
        } catch (err) {
          toast.error("Upload voice note failed");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (mail && mail.user_id && userData?._id && socket) {
      socketUserID(userData._id);
      socketUserWatching({
        id: userData._id,
        receiverId: mail.user_id,
      });
    }
    return () => {
      if (mail && mail.user_id && userData?._id && socket) {
        socketUserWatched({
          id: userData._id,
          receiverId: mail.user_id,
        });
        setisWatching(null);
      }
    };
  }, [mail, userData?._id, socket]);

  useEffect(() => {
    if (mail && mail.user_id && userData?._id) {
      POST("/api/chat", { sender: userData._id, receiver: mail.user_id })
        .then((response: any) => {
          if (response && response.status === "ok" && response.data) {
            setRealChatID(response.data._id);
          }
        })
        .catch((err) => {
          console.error("Failed to find or create chat:", err);
        });
    } else {
      setRealChatID("");
    }
  }, [mail, userData?._id]);

  const {
    data: messages,
    isLoading: messagesLoading,
    refetch,
  } = useQuery({
    queryKey: ["message", realChatID],
    queryFn: () => getMessage(realChatID),
    enabled: title == "Chats" && !!realChatID,
  });
  const {
    data: grpmessages,
    isLoading: grpmessagesLoading,
    refetch: refetch_grpmessages,
  } = useQuery({
    queryKey: ["grpmessages"],
    queryFn: () => getGroupMsg(userData._id, mail._id),
    enabled: title == "Groups",
  });
  const {
    data: Story,
    isLoading: storyLoading,
    refetch: refetchStory,
  } = useQuery({
    queryKey: ["Story"],
    queryFn: () => GetStatusByID(mail._id),
    enabled: title == "Story" && !!mail?._id,
  });

  useEffect(() => {
    if (realChatID) {
      refetch();
      socketRommID(realChatID);
      socket?.emit("mark_as_read", { chatID: realChatID, userID: userData?._id });
    }
  }, [realChatID]);
  useEffect(() => {
    if (scrollRef && scrollRef?.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]);
  const groupedMessages = groupMessagesByDate(
    messages?.map((elem: any) => ({ ...elem, time: getTime(elem.createdAt) }))
  );
  const grouped_GrpMessages = groupMessagesByDate(
    grpmessages?.map((elem: any) => ({
      ...elem,
      time: getTime(elem.createdAt),
    }))
  );

  const Messages = title == "Chats" ? groupedMessages : grouped_GrpMessages;
  const sections = Messages
    ? Object.keys(Messages).map((date) => ({
      title: date,
      data: Messages[date],
    }))
    : [];
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (inputData != "" && realChatID) {
      handleSendMsg({
        chatID: realChatID,
        sender: userData._id,
        receiver: mail.user_id,
        message: inputData,
        name: userData.name,
      });

      setinputData("");
    }
  };

  const name = mail?.given_name
    ? mail?.given_name
    : mail?.phone
      ? mail?.phone
      : mail?.group_name
        ? mail?.group_name
        : mail?.userName
          ? mail?.userName
          : null;

  //*Group
  const [formDatas, setformDatas] = useState({
    msg: "",
    sender_id: userData?._id,
    group_id: mail?._id,
  });

  const groupMembers =
    mail && title == "Groups"
      ? mail.members.filter((elem: any) => elem != userData._id)
      : [];
  const handleSubmitGroup = (e: any) => {
    e.preventDefault();
    if (
      formDatas.msg !== "" &&
      formDatas.group_id !== "" &&
      formDatas.sender_id !== ""
    ) {
      socketSendGroupMsg({
        msg: formDatas.msg,
        sender_id: userData?._id,
        group_id: mail?._id,
        receivers: groupMembers,
        name: userData?.name,
        group_name: mail?.group_name,
      });
      setformDatas((prev) => ({ ...prev, msg: "" }));
    }
  };
  useEffect(() => {
    if (mail && title == "Groups") {
      socketJoinGroup({ groupID: mail._id, userID: userData?._id });

      return () => {
        socketRemoveGroup({ groupID: mail._id, userID: userData?._id });
      };
    }
  }, []);

  return (
    <div className="flex h-[100vh] flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          {mail && (
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage
                  alt={name}
                  src={mail.image ? mail.image.url : ""}
                />
                <AvatarFallback>
                  {String(name || "")
                    .split(" ")
                    .map((chunk: any) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{name}</div>
                <div className="line-clamp-1 text-xs cursor-pointer">
                  {isReceiverTyping ? (
                    <span className="text-green-500 font-semibold animate-pulse">typing...</span>
                  ) : (
                    "View Profile"
                  )}
                </div>
              </div>
            </div>
          )}
          {/* <Separator orientation="vertical" className="mx-1 h-6" /> */}
          {/* <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">Snooze until</div>
                  <div className="grid min-w-[250px] gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      Later today{" "}
                      <span className="ml-auto text-muted-foreground">
                        {format(addHours(today, 4), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      Tomorrow
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 1), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      This weekend
                      <span className="ml-auto text-muted-foreground">
                        {format(nextSaturday(today), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      Next week
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 7), "E, h:m b")}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip> */}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip> */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!mail || !mail.user_id}
                onClick={() => startCall(mail.user_id, true)}
              >
                <PhoneCall className="h-4 w-4" />
                <span className="sr-only">Audio Call</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Audio Call</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!mail || !mail.user_id}
                onClick={() => startCall(mail.user_id, false)}
              >
                <Video className="h-4 w-4" />
                <span className="sr-only">Video Call</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video Call</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {title != "Story" ? (
        mail ? (
          <div className="flex flex-1 flex-col overflow-hidden h-full relative">
            {messagesLoading || grpmessagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader />
              </div>
            ) : messages?.length > 0 || grpmessages?.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-4 text-sm chatContainer">
                {sections.map((data: any, index: number) => {
                  return (
                    <div key={index}>
                      <div className="w-[100%] flex flex-col gap-1 justify-center items-center mb-2">
                        <h2 className="text-[#787878] font-bold">
                          {data.title}
                        </h2>
                      </div>
                      {data?.data.map((elem: any, msgIndex: number) => {
                        return (
                          <Bubble
                            key={msgIndex}
                            text={elem.message || elem.msg}
                            name={
                              elem.given_name ? elem.given_name : elem.phone
                            }
                            src={elem.image ? elem.image.url : ""}
                            id={elem.sender || elem.sender_id}
                            time={elem.time}
                            status={elem.status}
                            fileUrl={elem.fileUrl}
                            fileType={elem.fileType}
                          />
                        );
                      })}
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            ) : (
              <div className="flex-1 p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                No messages
              </div>
            )}
            {isReceiverWatching && (
              <img
                src="/jersapp/crossAvatar.png"
                alt="Watching Avatar"
                className="absolute bottom-[160px] left-0 z-10 w-[50px] h-[60px] object-contain animate-pulse"
              />
            )}
            <Separator className="mt-auto" />
            <div className="p-4 ">
              <form
                onSubmit={title == "Groups" ? handleSubmitGroup : handleSubmit}
              >
                <div className="grid gap-4 ">
                  <Textarea
                    value={title == "Groups" ? formDatas.msg : inputData}
                    onChange={(e) => {
                      title == "Groups"
                        ? setformDatas((prev) => ({
                          ...prev,
                          msg: e.target.value,
                        }))
                        : setinputData(e.target.value);
                    }}
                    onFocus={() => {
                      if (mail && mail.user_id && userData?._id) {
                        socketUserTyping({ id: userData._id, receiverId: mail.user_id });
                      }
                    }}
                    onBlur={() => {
                      if (mail && mail.user_id && userData?._id) {
                        socketUserTyped({ id: userData._id, receiverId: mail.user_id });
                      }
                    }}
                    className="p-4 rounded-[10px]"
                    placeholder={`Reply ${mail.given_name
                      ? mail.given_name
                      : mail.phone
                        ? mail.phone
                        : ""
                      }...`}
                  />
                  <div className="flex items-center">
                    <Label
                      htmlFor="mute"
                      className="flex items-center gap-2 text-xs font-normal"
                    >
                      <Switch id="mute" aria-label="Mute thread" /> Mute this
                      thread
                    </Label>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    />

                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full"
                        title="Attach file"
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`rounded-full ${isRecording ? "text-red-500 animate-pulse" : ""}`}
                        title={isRecording ? "Stop Recording" : "Record audio"}
                      >
                        {isRecording ? <Square className="h-5 w-5 fill-red-500" /> : <Mic className="h-5 w-5" />}
                      </Button>

                      <Button
                        type="submit"
                        size="sm"
                        className="rounded-[10px] flex gap-1"
                      >
                        <Send className="h-[20px]" /> Send
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="h-[600px] p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
            No {RemoveSfromName(title)} selected
          </div>
        )
      ) : storyLoading && mail ? (
        <Loader />
      ) : title == "Story" && mail ? (
        <div className="w=[100%] h-[90%] flex justify-center items-center">
          <div className="w-[100%] h-[80%]">
            <StoryCarosel story={Story.file} />
          </div>
        </div>
      ) : (
        <div className="h-[600px] p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
          No story selected
        </div>
      )}
    </div>
  );
}
