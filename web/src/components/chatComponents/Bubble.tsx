import React from "react";
import AvatarIcon from "./AvatarIcon";
import { GET_UserData } from "@/utils/EncryptedCookies";
import { Check, CheckCheck, FileText } from "lucide-react";
import { API } from "@/api";

type Props = {
  text: string;
  name: string;
  src?: any;
  id: any;
  time: any;
  status?: string;
  fileUrl?: string;
  fileType?: string;
};

export default function Bubble({ text, name, src, id, time, status, fileUrl, fileType }: Props) {
  const userData = GET_UserData();
  const isSender = userData ? userData?._id == id : false;

  const fullFileUrl = fileUrl ? (fileUrl.startsWith("http") ? fileUrl : (API || "") + fileUrl) : "";

  return (
    <div
      className={
        isSender
          ? "flex flex-row-reverse items-start gap-2.5 mb-3 justify-start"
          : "flex items-start gap-2.5 mb-3"
      }
    >
      <AvatarIcon name={name} src={src} />
      <div
        className={`flex flex-col w-full max-w-[320px] leading-relaxed p-3.5 rounded-2xl shadow-sm ${
          isSender
            ? "bg-[#3c3c3c] text-white rounded-tr-none"
            : "bg-[#1479d8] text-white rounded-tl-none"
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <span className="text-xs font-semibold text-white/80">
            {isSender ? "You" : name}
          </span>
          <span className="text-[10px] text-white/60">
            {time}
          </span>
        </div>

        {/* Media rendering section */}
        {fullFileUrl && (
          <div className="w-full mb-2 overflow-hidden rounded-lg">
            {fileType === "image" && (
              <img
                src={fullFileUrl}
                alt="Attachment"
                className="w-full max-h-[220px] object-cover hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                onClick={() => window.open(fullFileUrl, "_blank")}
              />
            )}
            {fileType === "video" && (
              <video
                src={fullFileUrl}
                controls
                className="w-full max-h-[220px] rounded-lg bg-black"
              />
            )}
            {fileType === "audio" && (
              <audio
                src={fullFileUrl}
                controls
                className="w-full h-8"
              />
            )}
            {fileType === "document" && (
              <a
                href={fullFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3.5 bg-black/25 hover:bg-black/35 rounded-xl border border-white/5 transition-all duration-200 group"
              >
                <div className="p-2 bg-white/10 rounded-lg text-white group-hover:bg-[#439BCC] transition-colors">
                  <FileText size={20} />
                </div>
                <span className="text-xs font-medium underline text-white/95 break-all line-clamp-2">
                  {fileUrl?.split("/").pop() || "Download File"}
                </span>
              </a>
            )}
          </div>
        )}

        {text && (
          <p className="text-sm font-normal text-white break-words whitespace-pre-wrap">
            {text}
          </p>
        )}

        {isSender && (
          <div className="flex justify-end items-center gap-1 mt-1">
            {status === "read" ? (
              <CheckCheck size={14} className="text-[#34B7F1]" />
            ) : status === "delivered" ? (
              <CheckCheck size={14} className="text-white/60" />
            ) : (
              <Check size={14} className="text-white/60" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
