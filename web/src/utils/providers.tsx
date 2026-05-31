"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import SocketProvider from "./socket";
import { usePathname, useRouter } from "next/navigation";
import { GET_LOCAL_STORAGE } from "./EncryptedCookies";
import GlobalContextProvider from "./globalContext";
import useWindowWidth from "@/hooks/windowData";
import { Toaster } from "react-hot-toast";
import CallOverlay from "@/components/chatComponents/CallOverlay";

type Props = {
  children: any;
};
export const queryClient = new QueryClient();
export default function Providers({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const userData = GET_LOCAL_STORAGE("JersApp_userData");
  useEffect(() => {
    if (userData) {
      router.push("/chats");
    } else {
      if (pathname != "/admin") {
        router.push("/");
      }
    }
  }, []);
  const windowWidth = useWindowWidth();

  // Redirect to home page if the window width is below 778px
  useEffect(() => {
    if (windowWidth < 778) {
      router.push("/");
    }
  }, [windowWidth, router]);
  return (
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalContextProvider>
          <Toaster position="top-center" />
          <CallOverlay />
          {children}
        </GlobalContextProvider>
      </QueryClientProvider>
    </SocketProvider>
  );
}
