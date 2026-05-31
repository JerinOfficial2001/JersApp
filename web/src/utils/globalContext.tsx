import { addChat, getAllChats } from "@/controllers/chat";
import { getContactByUserId } from "@/controllers/contacts";
import { GetGroups } from "@/controllers/groups";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "./providers";
import { GET_LOCAL_STORAGE } from "./EncryptedCookies";
import { useChat, useContact, useGroup, useStory } from "@/hooks/useData";
import { GetAllStatus } from "@/controllers/story";

const GlobalContext = createContext({});
export const useGlobalContext = () => {
  const data = useContext<any>(GlobalContext);
  return data;
};

export default function GlobalContextProvider({ children }: any) {
  const userDatas = GET_LOCAL_STORAGE("JersApp_userData");
  const JersAppThemes: any = {
    whatsappDark: {
      userContainer: "#111b21",
      header: "#202c33",
      text: "white",
      inputBg: "#2a3942",
      subText: "#ffffff99",
      chatContainer: "#0b141a",
      receiverBubbleColor: "#202c33",
      senderBubbleColor: "#005c4b",
    },
    whatsappLight: {
      userContainer: "white",
      header: "#f1efed",
      text: "black",
      inputBg: "",
      subText: "slategray",
      chatContainer: "#e4ddd9",
      receiverBubbleColor: "white",
      senderBubbleColor: "#dcf8c6",
    },
    JersApp: {
      userContainer: "#B8B8B80A",
      header: "#0E0E0E4A",
      text: "white",
      inputBg: "",
      subText: "slategray",
      chatContainer:
        "linear-gradient(125.42deg, rgba(9, 9, 9, 0.23) 8.37%, rgba(176, 176, 176, 0.2) 90.72%)",
      receiverBubbleColor:
        "linear-gradient(98.14deg, rgba(75, 76, 237, 0.71) 2.13%, #37B6E9 98.44%)",
      senderBubbleColor: "#242C3B",
    },
  };
  const [themeHandler, setthemeHandler] = useState<any>("JersApp");
  const [JersAppTheme, setJersAppTheme] = useState<any>(
    JersAppThemes[themeHandler]
  );
  useEffect(() => {
    setJersAppTheme(JersAppThemes[themeHandler]);
  }, [themeHandler]);

  const {
    data: Chats,
    isLoading: chatLoading,
    refetch: refetchChats,
    isFetched: chatFetched,
  } = useQuery({
    queryFn: getAllChats,
    queryKey: ["chats"],
    enabled: !!userDatas,
  });
  const {
    data: Contacts,
    refetch: refetchContacts,
    isLoading: contactsLoading,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: getContactByUserId,
    enabled: !!userDatas,
  });
  const {
    data: Groups,
    refetch: refetchGroups,
    isLoading: groupsLoading,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: GetGroups,
    enabled: !!userDatas,
  });
  const {
    data: Story,
    refetch: refetchStory,
    isLoading: storyLoading,
  } = useQuery({
    queryKey: ["story"],
    queryFn: GetAllStatus,
    enabled: !!userDatas,
  });
  const { mutate: AddChat, isPending: AddChatLoading } = useMutation({
    mutationFn: addChat,
    onSuccess: (data: any) => {
      if (data.message === "already registered") {
        setTitle("Chats");
      } else {
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    },
  });
  const [data, setdata] = useState<any>(Chats);
  const [chatConfig, setChatConfig] = useChat();
  const [contactConfig, setContactConfig] = useContact();
  const [groupConfig, setGroupConfig] = useGroup();
  const [storyConfig, setStoryConfig] = useStory();
  const [configs, setconfigs] = useState<any>(null);
  const [title, setTitle] = useState("Chats");

  const handleChatSelect = (chatId: string) => {
    setChatConfig({ selected: chatId });
  };
  const handleContactSelect = (ContactId: string) => {
    setContactConfig({ selected: ContactId });
  };
  const handleGroupSelect = (GroupId: string) => {
    setGroupConfig({ selected: GroupId });
  };
  const handleStorySelect = (StoryId: string) => {
    setStoryConfig({ selected: StoryId });
  };
  const handleSelectID = (id: string, name: string) => {
    switch (name) {
      case "Chats":
        handleChatSelect(id);
        setconfigs(chatConfig);
        break;
      case "Contacts":
        handleContactSelect(id);
        setconfigs(contactConfig);

        break;
      case "Groups":
        handleGroupSelect(id);
        setconfigs(groupConfig);
        break;
      case "Story":
        handleStorySelect(id);
        setconfigs(storyConfig);
        break;
      default:
        handleChatSelect(id);
        setconfigs(chatConfig);
    }
  };
  const handleSelectData = (name: string) => {
    switch (name) {
      case "Chats":
        setdata(Chats);
        break;
      case "Contacts":
        setdata(Contacts);

        break;
      case "Groups":
        setdata(Groups);
        break;
      case "Story":
        setdata(Story);
        break;
      default:
        setdata(Chats);
    }
  };
  useEffect(() => {
    if (!data) {
      setdata(Chats);
    }
  }, [chatFetched]);
  useEffect(() => {
    switch (title) {
      case "Chats":
        refetchChats();
        break;
      case "Contacts":
        refetchContacts();

        break;
      case "Groups":
        refetchGroups();
        break;
      case "Story":
        refetchStory();
        break;
      default:
        refetchChats();
    }
  }, [title]);

  return (
    <GlobalContext.Provider
      value={{
        JersAppTheme,
        themeHandler,
        setthemeHandler,
        Chats,
        Contacts,
        Groups,
        Story,
        AddChat,
        contactsLoading,
        chatLoading,
        groupsLoading,
        AddChatLoading,
        storyLoading,
        refetchGroups,
        refetchChats,
        refetchContacts,
        refetchStory,
        handleSelectID,
        configs,
        handleSelectData,
        data,
        title,
        setTitle,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
