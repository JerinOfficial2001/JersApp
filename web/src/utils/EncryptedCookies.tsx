import { SECRET_KEY } from "@/api";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

export const setEncryptedCookie = (name: string, value: any) => {
  try {
    const encryptedValue = CryptoJS.AES.encrypt(
      value,
      SECRET_KEY || ""
    ).toString();
    const option = {
      httpOnly: false,
      secure: typeof window !== "undefined" && window.location.protocol === "https:",
    };
    Cookies.set(name, encryptedValue, option);
  } catch (error) {
    console.error("Encryption Error:", error);
    // Handle the error appropriately (e.g., logging, fallback mechanism)
  }
};

export const getDecryptedCookie = (name: string) => {
  const encryptedValue = Cookies.get(name);

  if (encryptedValue) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY || "");
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption Error:", error);
      return null; // Return null or handle the error case based on your application's logic
    }
  }
  return null;
};
export const GET_LOCAL_STORAGE = (key: string) => {
  const cachedData = getDecryptedCookie(key);
  const data = cachedData ? JSON.parse(cachedData) : null;
  return data;
};
export const SET_LOCAL_STORAGE = (name: string, value: any) => {
  setEncryptedCookie(name, JSON.stringify(value));
};
export const SET_UserData = (value: any) => {
  setEncryptedCookie("JersApp_userData", JSON.stringify(value));
};
export const GET_UserData = () => {
  const cachedData = GET_LOCAL_STORAGE("JersApp_userData");
  return cachedData;
};
