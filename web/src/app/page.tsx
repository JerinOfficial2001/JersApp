"use client";
import Loader from "@/components/chatComponents/Loader";
import { getAPK } from "@/controllers/apk";
import { AuthenticateByToken, login as loginAPI } from "@/controllers/auth";
import useWindowWidth from "@/hooks/windowData";
import { useSocket } from "@/utils/socket";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Ban,
  Download,
  Loader2,
  MessageCircle,
  Monitor,
  QrCode,
  Smartphone,
  Wifi,
} from "lucide-react";
import QRCode from "qrcode.react";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const steps = [
  {
    icon: <Smartphone size={20} />,
    text: "Open JersApp on your phone",
  },
  {
    icon: <MessageCircle size={20} />,
    text: 'Tap the menu icon ⋮ on the Home screen',
  },
  {
    icon: <QrCode size={20} />,
    text: "Select 'JersApp Web' from the menu",
  },
  {
    icon: <Monitor size={20} />,
    text: "Point your camera at the QR code",
  },
];

export default function Home() {
  const { socketID, token, handleAuthSuccess } = useSocket();
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [mobNum, setMobNum] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: Authenticate } = useMutation({
    mutationFn: AuthenticateByToken,
    onSuccess: (data) => {
      handleAuthSuccess(data?._id);
    },
    onError: (err) => {
      console.log(err, "AUTH ");
    },
  });

  const { mutate: handlePasswordLogin, isPending: loggingIn } = useMutation({
    mutationFn: loginAPI,
    onError: (err) => {
      console.error(err);
      toast.error("Login failed");
    },
  });

  useEffect(() => {
    if (token) {
      Authenticate(token);
    }
  }, [token]);

  const { data: APK, isLoading: isApkLoading } = useQuery({
    queryKey: ["apk"],
    queryFn: getAPK,
    refetchOnWindowFocus: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setisClient] = useState(false);

  useEffect(() => {
    setisClient(true);
  }, []);

  const handleDownload = async () => {
    if (APK && APK.apkUrl) {
      setIsLoading(true);
      try {
        const downloadUrl = APK.apkUrl;
        const response = await fetch(downloadUrl);
        if (response.ok) {
          const blob = await response.blob();
          const contentDisposition =
            response.headers.get("Content-Disposition") || "";
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          const filename = filenameMatch ? filenameMatch[1] : "JersApp.apk";
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        } else {
          // If fetch fails (CORS or other error), fallback to direct window open
          window.open(downloadUrl, "_blank");
        }
      } catch (error) {
        console.error("Download error:", error);
        window.open(APK.apkUrl, "_blank");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("APK URL not configured");
    }
  };

  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth > 900;

  return (
    <>
      {isClient && (
        <div className="min-h-screen bg-[#0d1117] text-white overflow-hidden relative">
          {/* Animated background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, #439BCC 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-15"
              style={{
                background:
                  "radial-gradient(circle, #2F58A7 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
          </div>

          {/* Navbar */}
          <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Image
                src="/jersapp/Logo.png"
                alt="JersApp Logo"
                width={100}
                height={40}
              />
            </div>
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                {socketID ? "Connected" : "Connecting..."}
              </span>
            </div>
          </nav>

          {/* Main content */}
          <main
            className={`relative z-10 flex ${isDesktop ? "flex-row" : "flex-col"
              } items-center justify-center min-h-[calc(100vh-72px)] gap-16 px-8 py-12`}
          >
            {/* Left column */}
            <div className="flex flex-col items-center gap-8 max-w-md">
              {/* Hero */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center float"
                  style={{
                    boxShadow: "0 20px 60px rgba(67, 155, 204, 0.4)",
                  }}
                >
                  <Image
                    src="/jersapp/JersApp Icon.png"
                    alt="JersApp Logo"
                    width={100}
                    height={100}
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    JersApp Web
                  </h1>
                  <p className="text-white/50 mt-2 text-base">
                    Use your chats on desktop — instantly.
                  </p>
                </div>
              </div>

              {/* Instructions (desktop only) */}
              {isDesktop && (
                <div
                  className="w-full rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
                    How to connect
                  </h2>
                  <ol className="flex flex-col gap-3">
                    {steps.map((step, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{
                            background: "rgba(67, 155, 204, 0.2)",
                            border: "1px solid rgba(67, 155, 204, 0.3)",
                          }}
                        >
                          {step.icon}
                        </div>
                        <span className="text-sm text-white/70">{step.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Download APK */}
              <button
                id="download-apk-btn"
                onClick={isApkLoading || isLoading || !APK ? undefined : handleDownload}
                disabled={isApkLoading || isLoading || !APK}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: APK
                    ? "linear-gradient(135deg, #e91e8c, #f97316)"
                    : "rgba(255,255,255,0.06)",
                  border: APK
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: APK ? "0 8px 32px rgba(233, 30, 140, 0.3)" : "none",
                }}
              >
                {isApkLoading || isLoading ? (
                  <Loader2 size={18} className="loadingBtn" />
                ) : APK ? (
                  <Download size={18} />
                ) : (
                  <Ban size={18} className="text-red-400" />
                )}
                {APK ? "Download Android App" : "APK unavailable"}
              </button>
            </div>

            {/* QR or Password Login Card */}
            <div className="flex flex-col items-center gap-6">
              {!showPasswordLogin ? (
                <div
                  className="rounded-3xl p-8 flex flex-col items-center gap-4 w-[350px]"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="flex flex-col items-center gap-1 mb-2">
                    <QrCode size={16} className="text-white/40" />
                    <span className="text-xs text-white/40 tracking-widest uppercase">
                      Scan to connect
                    </span>
                  </div>

                  <div
                    className="rounded-2xl overflow-hidden p-4"
                    style={{ background: "white" }}
                  >
                    {socketID ? (
                      <QRCode
                        style={{ height: 240, width: 240 }}
                        value={socketID}
                        level="M"
                        fgColor="#0d1117"
                        bgColor="white"
                      />
                    ) : (
                      <div
                        style={{ height: 240, width: 240 }}
                        className="flex items-center justify-center"
                      >
                        <Loader />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-white/30 max-w-[200px] text-center leading-relaxed">
                    QR code refreshes when your session changes
                  </p>

                  <button
                    onClick={() => setShowPasswordLogin(true)}
                    className="text-xs text-[#439BCC] hover:underline font-semibold mt-2"
                  >
                    Or log in with Phone Number
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (mobNum && password) {
                      handlePasswordLogin({ mobNum, password });
                    }
                  }}
                  className="rounded-3xl p-8 flex flex-col gap-4 w-[350px]"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="flex flex-col items-center gap-1 mb-2">
                    <Smartphone size={16} className="text-white/40" />
                    <span className="text-xs text-white/40 tracking-widest uppercase">
                      Login to Account
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/60 font-semibold">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={mobNum}
                      onChange={(e) => setMobNum(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#439BCC] text-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/60 font-semibold">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#439BCC] text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 text-white mt-2"
                    style={{
                      background: "linear-gradient(135deg, #439BCC, #2F58A7)",
                      boxShadow: "0 8px 32px rgba(67, 155, 204, 0.3)",
                    }}
                  >
                    {loggingIn ? (
                      <Loader2 size={18} className="loadingBtn" />
                    ) : (
                      "Login"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasswordLogin(false)}
                    className="text-xs text-[#439BCC] hover:underline font-semibold mt-2 text-center"
                  >
                    Back to QR Code scan
                  </button>
                </form>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 text-center py-4 text-white/20 text-xs border-t border-white/5">
            JersApp © {new Date().getFullYear()} — Real-time chat for everyone
          </footer>
        </div>
      )}
    </>
  );
}
