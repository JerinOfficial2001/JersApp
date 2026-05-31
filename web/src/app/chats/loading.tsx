import Loader from "@/components/chatComponents/Loader";
import React from "react";

type Props = {};

export default function loading({}: Props) {
  return (
    <div className="flex items-center justify-center h-[100vh] w-[100%]">
      <Loader />
    </div>
  );
}
