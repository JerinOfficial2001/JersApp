import { GET, POST } from "@/services/requests";
import toast from "react-hot-toast";

export const getAPK = async () => {
  try {
    const data = await GET("/api/config/apk");
    if (data && data.status == "ok") {
      return data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateAPK = async (apkUrl: string, adminKey: string) => {
  try {
    const data = await POST("/api/config/apk", { apkUrl, adminKey });
    if (data && data.status == "ok") {
      toast.success("APK URL updated successfully!");
      return data.data;
    } else {
      toast.error(data?.message || "Failed to update APK URL");
      return null;
    }
  } catch (error) {
    console.log(error);
    toast.error("Failed to update APK URL");
  }
};
