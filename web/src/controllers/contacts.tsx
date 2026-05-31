import { GET_LOCAL_STORAGE } from "@/utils/EncryptedCookies";
import { DELETE, GET, POST } from "../services/requests";
import toast from "react-hot-toast";

export const getContactByUserId = async () => {
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  try {
    const response = await GET(`/api/contact?user_id=${userData?._id}`);
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
};
export const deleteContactById = async (
  sender_id: any,
  receiver_id: any,
  contact_id: any
) => {
  try {
    const response = await DELETE(
      `/api/contact?sender_id=${sender_id}&receiver_id=${receiver_id}&Contact_id=${contact_id}`
    );

    return response;
  } catch (error) {
    console.log(error);
  }
};
