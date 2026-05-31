import { GET_LOCAL_STORAGE } from "@/utils/EncryptedCookies";
import { DELETE, GET, POST } from "../services/requests";
import toast from "react-hot-toast";

export const getMessage = async (chatID: any) => {
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  if (!userData || !chatID) return [];
  try {
    const response = await GET("/api/message?chatID=" + chatID);

    if (response.status == "ok") {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching message:", error);
  }
};
export const getAllChats = async () => {
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  if (userData) {
    try {
      const response = await GET(`/api/chats?user_id=${userData?._id}`);
      if (response.status == "ok") {
        return response.data;
      } else {
        toast.error(response.message);
        return [];
      }
    } catch (error) {
      toast.error("Failed to load");
      return error;
    }
  } else {
    return [];
  }
};
export const addChat = async (id: any) => {
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  if (userData) {
    try {
      const data = await POST("/api/contact?userID=" + userData._id, id);
      return data;
    } catch (error) {
      console.log(error);
    }
  } else {
    toast.error("Un-authenticated");
  }
};
export const deleteMessageById = async (id: any) => {
  try {
    const response = await DELETE(`/api/message?id=${id}`);

    return response;
  } catch (error) {
    console.log(error);
  }
};
