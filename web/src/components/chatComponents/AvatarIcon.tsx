import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Props = {
  src?: string;
  name: string;
};

export default function AvatarIcon({ src, name }: Props) {
  return (
    <Avatar>
      <AvatarImage src={src || ""} alt={"JersApp"} />
      <AvatarFallback>
        {String(name || "")
          .split(" ")
          .map((chunk) => chunk[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
}
