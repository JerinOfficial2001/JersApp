import { POST } from "@/services/requests";
import { GET_UserData } from "@/utils/EncryptedCookies";

const userData = GET_UserData();
export const sendMsg = async (formData: object) => {
  try {
    const data = await POST("/api/message", formData);
    return data;
  } catch (error) {
    return null;
  }
};
