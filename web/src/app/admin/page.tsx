"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Admin() {
  const [hide, sethide] = useState(true);
  const [adminKey, setadminKey] = useState("");

  const handleEnableForm = () => {
    if (adminKey == "Admin@241323") {
      if (typeof window !== "undefined") {
        localStorage.setItem("JersApp_AdminKey", adminKey);
        window.location.href = "/jersapp/admin/dashboard";
      }
    } else {
      toast.error("Admin Key is Invalid");
    }
  };

  const handleHidePw = () => {
    sethide(!hide);
  };

  return (
    <div className="h-[100vh] w-[100%] flex justify-center items-center">
      <div className="w-[300px] flex flex-col items-center justify-center gap-3">
        <div className="relative flex justify-center items-center w-[100%]">
          <Input
            type={hide ? "password" : "text"}
            className="rounded-[10px]"
            value={adminKey}
            onChange={(e) => setadminKey(e.target.value)}
            placeholder="Admin Key"
          />
          {hide ? (
            <Eye className="absolute right-2 cursor-pointer" onClick={handleHidePw} />
          ) : (
            <EyeOff className="absolute right-2 cursor-pointer" onClick={handleHidePw} />
          )}
        </div>
        <Button
          className="rounded-[10px] w-[100%]"
          onClick={handleEnableForm}
        >
          Login
        </Button>
      </div>
    </div>
  );
}
