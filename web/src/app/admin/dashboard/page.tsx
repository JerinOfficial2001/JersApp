"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { RefreshCw, Download, Save, LogOut } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAPK, updateAPK } from "@/controllers/apk";
import Cookies from "js-cookie";

export default function AdminDashboard() {
  const [apkUrl, setApkUrl] = useState("");

  const { data: APK, isLoading: isFetching } = useQuery({
    queryKey: ["apk"],
    queryFn: getAPK,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (APK && APK.apkUrl) {
      setApkUrl(APK.apkUrl);
    }
  }, [APK]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = localStorage.getItem("JersApp_AdminKey");
      if (key !== "Admin@241323") {
        window.location.href = "/jersapp/admin";
      }
    }
  }, []);

  const { mutate: handleUpdate, isPending: isUpdating } = useMutation({
    mutationFn: () => {
      const adminKey = typeof window !== "undefined" ? localStorage.getItem("JersApp_AdminKey") || "" : "";
      return updateAPK(apkUrl, adminKey);
    },
    onSuccess: () => {
      // toast success handled in controller
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate();
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("JersApp_AdminKey");
      window.location.href = "/jersapp";
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white overflow-hidden relative flex flex-col">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #439BCC 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #2F58A7 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-[#439BCC] to-[#2F58A7] bg-clip-text text-transparent">
            Admin Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleLogout} className="text-white/70 hover:text-white">
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        <div
          className="w-full max-w-lg rounded-3xl p-8 flex flex-col gap-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex flex-col items-center gap-2 text-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#439BCC] to-[#2F58A7] flex items-center justify-center mb-2">
              <Download size={32} color="white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">APK Configuration</h2>
            <p className="text-sm text-white/50">
              Manage the Android app download link shown on the landing page.
            </p>
          </div>

          {isFetching ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="animate-spin text-[#439BCC]" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                  APK Download URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/jersapp.apk"
                  value={apkUrl}
                  onChange={(e) => setApkUrl(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-auto text-sm focus:outline-none focus:border-[#439BCC] text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdating}
                className="mt-4 flex items-center justify-center gap-2 px-6 py-3 h-auto rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 text-white"
                style={{
                  background: "linear-gradient(135deg, #439BCC, #2F58A7)",
                  boxShadow: "0 8px 32px rgba(67, 155, 204, 0.3)",
                }}
              >
                {isUpdating ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Configuration
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
