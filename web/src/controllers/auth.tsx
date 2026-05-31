import { API } from "@/api";
import { GET, POST, PUT } from "@/services/requests";
import { GET_LOCAL_STORAGE, SET_UserData } from "@/utils/EncryptedCookies";
import toast from "react-hot-toast";

const userData = GET_LOCAL_STORAGE("JersApp_userData");
export const login = async (formData: any) => {
  const { mobNum, password } = formData;
  try {
    const data = await POST("/api/auth/login", { mobNum, password });
    if (data.status === "ok") {
      const token = data.data.accessToken || data.data.token;
      const userData = await GET("/api/auth/login", token);
      if (userData) {
        if (userData.status === "ok") {
          SET_UserData(userData.data);
          window.location.href = "/chats";
        } else {
          toast.error(userData.data);
        }
        return userData;
      }
    } else if (data.status == "error" && data.message == "User not found") {
      toast.error(data.message);
    } else {
      toast.error(data.message);
    }
    return data;
  } catch (error) {
    console.error("Error at Login:", error);
  }
};
export const register = async (Data: any, formData: any) => {
  try {
    const data = await POST("/api/auth/register", formData);
    return data;
  } catch (error) {
    console.error("Error at Register:", error);
  }
};
export const AuthenticateByToken = async (token: string) => {
  try {
    const data = await GET("/api/auth/login", token);

    if (data.status == "ok") {
      SET_UserData(data.data);
      window.location.href = "/chats";
      return data.data;
    } else {
      toast.error(data.message);
      return null;
    }
  } catch (error) {
    console.log(error, "Err at Auth by token");
  }
};
export const getAllUsers = async (userID: string) => {
  try {
    const response = await GET("/api/auth/getUsers");
    if (response.status == "ok") {
      return response.data;
    } else {
      console.log("getAllUsers:", response);
      return [];
    }
  } catch (error) {
    console.error("Error at getAllUsers res:", error);
  }
};
export const GetUsersByID = async (id: string) => {
  try {
    const data = await GET(`/api/auth/get/${id}`);

    if (data && data.status == "ok") {
      return data.data;
    } else if (data) {
      toast.error(data.message || "Failed to fetch user");
    }
  } catch (error) {
    console.error("GetUsersByID Err:", error);
    toast.error("Failed to fetch user");
  }
};
export const UpdateProfile = async (DATA: any) => {
  const { formData, id } = DATA;
  try {
    const data = await PUT(`/api/auth/update/${id}`, formData);
    return data;
  } catch (error) {
    console.error("Error at UpdateProfile:", error);
  }
};
export const UpdateThemeByID = async (formData: any) => {
  try {
    const data = await POST(
      `/api/auth/updateTheme/${formData.id}`,
      formData.data
    );

    if (data && data.status === "ok") {
      toast.success(data.message || "Theme updated");
    } else if (data) {
      toast.error(data.message || "Failed to update theme");
    } else {
      toast.error("Something went wrong");
    }
  } catch (error) {
    console.error("UpdateThemeByID Err:", error);
    toast.error("Failed to update theme");
  }
};
export const getUserNameByID = async (id: string) => {
  const allUsers = await getAllUsers(userData._id);
  if (allUsers) {
    const user = allUsers.find((elem: any) => elem._id == id);
    return user;
  } else {
    return null;
  }
};
