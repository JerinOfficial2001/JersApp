"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "@/utils/socket";
import { getUserNameByID } from "@/controllers/auth";
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CallOverlay() {
  const {
    callState,
    incomingCall,
    isAudioOnly,
    activeCallPartner,
    localStream,
    remoteStream,
    isMuted,
    isVideoMuted,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useSocket();

  const [partnerName, setPartnerName] = useState<string>("User");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (activeCallPartner) {
      getUserNameByID(activeCallPartner)
        .then((res: any) => {
          if (res && res.name) {
            setPartnerName(res.name);
          } else if (res && res.userName) {
            setPartnerName(res.userName);
          }
        })
        .catch(() => {
          setPartnerName("User");
        });
    }
  }, [activeCallPartner]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  if (callState === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md text-white select-none">
      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-black to-slate-900/30 -z-10" />

      {callState === "incoming" && (
        <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl w-[90%] max-w-md text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <Avatar className="h-24 w-24 border-2 border-green-500 shadow-lg relative">
              <AvatarFallback className="text-3xl bg-neutral-800 text-white">
                {partnerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-bold mb-1">{partnerName}</h2>
          <p className="text-sm text-green-400 font-medium tracking-wide animate-pulse mb-8">
            Incoming {isAudioOnly ? "Audio" : "Video"} Call...
          </p>

          <div className="flex items-center gap-8">
            <Button
              onClick={acceptCall}
              size="icon"
              className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 transition-transform active:scale-95 shadow-lg shadow-green-500/30 flex items-center justify-center"
            >
              <Phone className="h-7 w-7 text-white fill-current" />
            </Button>
            <Button
              onClick={declineCall}
              size="icon"
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 transition-transform active:scale-95 shadow-lg shadow-red-500/30 flex items-center justify-center"
            >
              <PhoneOff className="h-7 w-7 text-white fill-current" />
            </Button>
          </div>
        </div>
      )}

      {callState === "calling" && (
        <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl w-[90%] max-w-md text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse duration-1000" />
            <Avatar className="h-24 w-24 border-2 border-blue-400 shadow-lg relative">
              <AvatarFallback className="text-3xl bg-neutral-800 text-white">
                {partnerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-bold mb-1">{partnerName}</h2>
          <p className="text-sm text-blue-400 font-medium tracking-wide animate-pulse mb-8">
            Calling...
          </p>

          <Button
            onClick={endCall}
            size="icon"
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 transition-transform active:scale-95 shadow-lg shadow-red-500/30 flex items-center justify-center"
          >
            <PhoneOff className="h-7 w-7 text-white fill-current" />
          </Button>
        </div>
      )}

      {callState === "active" && (
        <div className="relative w-full h-full flex flex-col justify-between p-6">
          {/* Main Remote View */}
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-950">
            {isAudioOnly ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-zinc-900/50">
                <Avatar className="h-32 w-32 border-4 border-white/10 shadow-2xl animate-pulse">
                  <AvatarFallback className="text-4xl bg-neutral-800 text-white">
                    {partnerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xl font-semibold">{partnerName}</div>
                <div className="text-sm text-neutral-400 flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-green-500" /> Active Audio Call
                </div>
              </div>
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Floating Local View (PiP) */}
          {!isAudioOnly && localStream && (
            <div className="absolute top-6 right-6 w-36 h-48 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-20 bg-black">
              {isVideoMuted ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <VideoOff className="h-8 w-8 text-white/50" />
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}
            </div>
          )}

          {/* Header Info */}
          <div className="relative z-10 self-start bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="text-sm font-semibold">{partnerName}</span>
          </div>

          {/* Controller Bar */}
          <div className="relative z-10 self-center flex items-center gap-6 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl mb-4">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full transition-all flex items-center justify-center ${
                isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {!isAudioOnly && (
              <Button
                onClick={toggleVideo}
                variant="ghost"
                size="icon"
                className={`h-12 w-12 rounded-full transition-all flex items-center justify-center ${
                  isVideoMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
              </Button>
            )}

            <Button
              onClick={endCall}
              size="icon"
              className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 transition-transform active:scale-95 shadow-lg shadow-red-500/30 flex items-center justify-center"
            >
              <PhoneOff className="h-6 w-6 text-white fill-current" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
