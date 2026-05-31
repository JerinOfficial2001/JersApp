import toast from "react-hot-toast";
import { GET, POST, PUT } from "../services/requests";
import { GET_LOCAL_STORAGE } from "@/utils/EncryptedCookies";

export const GetGroups = async () => {
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  if (userData) {
    try {
      const data = await GET(`/api/group/getGroups?userID=${userData._id}`);
      if (data && data.status == "ok") {
        return data.data;
      } else if (data) {
        toast.error(data.message || "Failed to load groups");
        console.log(data.message, "GetGroupsERR");
        return [];
      }
      return [];
    } catch (error) {
      console.log("GetGroupsERR Err:", error);
      toast.error("Failed to load groups");
      return [];
    }
  } else {
    toast.error("Unauthorized");
    return [];
  }
};
export const GetGroupByID = async ({ id, groupID }: any) => {
  try {
    const data = await GET(`/api/group/getgroupbyid/${groupID}?userID=${id}`);
    if (data && data.status == "ok") {
      return data.data;
    } else if (data) {
      toast.error(data.message || "Failed to load group");
      console.log(data.message, "GetGroupsERR");
    }
  } catch (error) {
    console.log("GetGroupsERR Err:", error);
    toast.error("Failed to load group");
  }
};
export const getGroupMsg = async (id: string, groupID: string) => {
  try {
    const data = await GET(`/api/groupMsg?userID=${id}&groupID=${groupID}`);
    if (data && data.status == "ok") {
      return data.data;
    } else if (data) {
      toast.error(data.message || "Failed to load messages");
      return [];
    }
    return [];
  } catch (error) {
    console.log("getGroupMsgERR", error);
    toast.error("Failed to load group messages");
    return [];
  }
};
export const CreateNewGroup = async ({ token, id, formData }: any) => {
  try {
    const data = await POST(`/api/group/creategroup?userID=${id}`, formData);
    if (data && data.status == "ok") {
      return data;
    } else if (data) {
      toast.error(data.message || "Failed to create group");
    }
  } catch (error) {
    console.log("CreateGroup Err:", error);
    toast.error("Failed to create group");
  }
};
export const UpdateGroup = async ({ token, id, formData, groupID }: any) => {
  try {
    const data = await PUT(
      `/api/group/updategroup/${groupID}?userID=${id}`,
      formData
    );
    if (data && data.status == "ok") {
      return data;
    } else if (data) {
      toast.error(data.message || "Failed to update group");
    }
  } catch (error) {
    console.log("UpdateGroup Err:", error);
    toast.error("Failed to update group");
  }
};
