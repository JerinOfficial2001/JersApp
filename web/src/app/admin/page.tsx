"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/controllers/auth";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

type Props = {};

export default function Admin({}: Props) {
  const [inputData, setinputData] = useState({
    mobNum: "",
    password: "",
  });
  const [hide, sethide] = useState(true);
  const [adminKey, setadminKey] = useState("");
  const [isFormEnabled, setisFormEnabled] = useState(false);
  const handleEnableForm = () => {
    if (adminKey == "Admin@241323") {
      setisFormEnabled(true);
      sethide(true);
    } else {
      toast.error("Admin Key is Invalid");
    }
  };
  const { mutate: handleLogin, isPending } = useMutation({
    mutationFn: login,
  });
  const handleSubmit = () => {
    if (inputData.password != "" && inputData.mobNum != "") {
      handleLogin(inputData);
    } else {
      toast.error("All fields are mandatory");
    }
  };
  const handleHidePw = () => {
    sethide(!hide);
  };
  return (
    <div className="h-[100vh] w-[100%] flex justify-center items-center">
      <div className="w-[300px] flex flex-col items-center justify-center gap-3">
        {!isFormEnabled ? (
          <div className="relative flex justify-center items-center">
            <Input
              type={hide ? "password" : "text"}
              className="rounded-[10px]"
              value={adminKey}
              onChange={(e) => setadminKey(e.target.value)}
              placeholder="Admin Key"
            />
            {hide ? (
              <Eye className="absolute right-2" onClick={handleHidePw} />
            ) : (
              <EyeOff className="absolute right-2" onClick={handleHidePw} />
            )}
          </div>
        ) : (
          <>
            <Input
              type="number"
              className="rounded-[10px]"
              value={inputData.mobNum}
              onChange={(e) =>
                setinputData((prev) => ({ ...prev, mobNum: e.target.value }))
              }
              placeholder="Phone"
            />
            <div className="relative flex justify-center items-center w-[100%]">
              <Input
                type={hide ? "password" : "text"}
                className="rounded-[10px]"
                value={inputData.password}
                placeholder="Password"
                onChange={(e) =>
                  setinputData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
              {hide ? (
                <Eye className="absolute right-2" onClick={handleHidePw} />
              ) : (
                <EyeOff className="absolute right-2" onClick={handleHidePw} />
              )}
            </div>
          </>
        )}
        <Button
          className="rounded-[10px]"
          onClick={isFormEnabled ? handleSubmit : handleEnableForm}
        >
          {isPending ? (
            <RefreshCw className="loadingBtn" />
          ) : !isFormEnabled ? (
            "Next"
          ) : (
            "Login"
          )}
        </Button>
      </div>
    </div>
  );
}
