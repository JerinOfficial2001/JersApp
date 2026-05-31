import { GET, POST, DELETE } from "@/services/requests";
import { GET_UserData } from "@/utils/EncryptedCookies";
import toast from "react-hot-toast";

const userData = GET_UserData();
export const AddStatus = async (formData: any) => {
  try {
    const data: any = await POST(`/api/status/add`, formData, "multipart");

    if (data && data.status == "ok") {
      return data;
    } else if (data) {
      toast.error(data.message || "Failed to post status");
    }
  } catch (error) {
    console.log("AddStatus Err:", error);
    toast.error("Failed to post status");
  }
};
export const GetAllStatus = async () => {
  try {
    const data: any = await GET("/api/status/get?userID=" + userData._id);
    if (data && data.status == "ok") {
      return data.data;
    } else if (data) {
      toast.error(data.message || "Failed to load statuses");
    }
  } catch (error) {
    console.log("GetAllStatus Err:", error);
    toast.error("Failed to load statuses");
  }
};
export const GetStatusByID = async (id: any) => {
  try {
    const data: any = await GET(`/api/status/get/${id}`);
    if (data && data.status == "ok") {
      return data.data;
    } else if (data) {
      toast.error(data.message || "Failed to load status");
    }
  } catch (error) {
    console.log("GetStatusByID Err:", error);
    toast.error("Failed to load status");
  }
};
export const DeleteStatus = async (id: any) => {
  try {
    const data: any = await DELETE(`/api/status/delete/${id}`);
    if (data && data.status == "ok") {
      toast.success("Status deleted");
      return data.data;
    } else if (data) {
      toast.error(data.message || "Failed to delete status");
    }
  } catch (error) {
    console.log("DeleteStatus Err:", error);
    toast.error("Failed to delete status");
  }
};
