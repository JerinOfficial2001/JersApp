import { API, GetAPK_API } from "@/api";
import { GET_LOCAL_STORAGE } from "@/utils/EncryptedCookies";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const getHeaders = () => {
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  return userData
    ? {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      }
    : {};
};

const getMultipartHeaders = () => {
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  return userData
    ? {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    : {};
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong"
    );
  }
  return "Something went wrong";
};

export const GET = async (queryOrParams: any, token?: string) => {
  try {
    const { data } = await axios.get(
      API + queryOrParams,
      token ? { headers: { Authorization: `Bearer ${token}` } } : getHeaders()
    );
    return data;
  } catch (error) {
    const msg = getErrorMessage(error);
    toast.error(msg);
  }
};
export const POST = async (
  queryOrParams: any,
  formData: any,
  isMultipart?: any
) => {
  try {
    const { data } = await axios.post(
      API + queryOrParams,
      formData,
      isMultipart ? getMultipartHeaders() : getHeaders()
    );
    return data;
  } catch (error) {
    const msg = getErrorMessage(error);
    toast.error(msg);
  }
};
export const PUT = async (
  queryOrParams: any,
  formData: any,
  isMultipart?: any
) => {
  try {
    const { data } = await axios.put(
      API + queryOrParams,
      formData,
      isMultipart ? getMultipartHeaders() : getHeaders()
    );
    return data;
  } catch (error) {
    const msg = getErrorMessage(error);
    toast.error(msg);
  }
};
export const DELETE = async (queryOrParams: any) => {
  try {
    const { data } = await axios.delete(API + queryOrParams, getHeaders());
    return data;
  } catch (error) {
    const msg = getErrorMessage(error);
    toast.error(msg);
  }
};
export const GET_Apk = async (queryOrParams: any) => {
  try {
    const { data } = await axios.get(GetAPK_API + queryOrParams);
    return data;
  } catch (error) {
    const msg = getErrorMessage(error);
    toast.error(msg);
  }
};
