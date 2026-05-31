import { DownloadAPK_API } from "@/api";
import { GET_Apk } from "@/services/requests";
import toast from "react-hot-toast";

export const getAPK = async () => {
  try {
    const data = await GET_Apk(
      "/Projects/getapk?userID=66276a73361a148fef6608c2&projectID=66927272e38e6ffa8d666702"
    );
    if (data && data.status == "ok") {
      return data.data;
    } else {
      toast.error(data.message);
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};
// export const DownloadAPK_URL = `http://localhost:4000/portfolio/Projects/downloadapk`;
export const DownloadAPK_URL = `${DownloadAPK_API}/Projects/downloadapk`;
