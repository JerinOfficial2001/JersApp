"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { useGlobalContext } from "@/utils/globalContext";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon | React.JSX.Element;
    variant: "default" | "ghost";
  }[];
  setTitle?: any;
  title?: string;
  onClick?: any;
}

export function Nav({
  links,
  isCollapsed,
  setTitle,
  title,
  onClick,
}: NavProps) {
  const { handleSelectData } = useGlobalContext();
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2 cursor-pointer"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link: any, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  onClick={
                    setTitle
                      ? () => {
                          setTitle(link.title);
                          handleSelectData(link.title);
                        }
                      : onClick
                      ? onClick
                      : undefined
                  }
                  className={cn(
                    buttonVariants({
                      variant: link.title == title ? "default" : "ghost",
                      size: "icon",
                    }),
                    "h-9 w-9 rounded-[10px]",
                    link.variant === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <link.icon className="h-4 w-4 " />
                  <span className="sr-only cursor-pointer">{link.title}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div
              onClick={
                setTitle
                  ? () => {
                      setTitle(link.title);
                      handleSelectData(link.title);
                    }
                  : onClick
                  ? onClick
                  : undefined
              }
              key={index}
              className={cn(
                buttonVariants({
                  variant: link.title == title ? "default" : "ghost",
                  size: "sm",
                }),
                link.variant === "default" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start rounded-[10px] cursor-pointer"
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto"
                    // link.variant === "default" &&
                    //   "text-background dark:text-white "
                  )}
                >
                  {link.label}
                </span>
              )}
            </div>
          )
        )}
      </nav>
    </div>
  );
}
