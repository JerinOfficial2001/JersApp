"use client";

import * as React from "react";
import Cookies from "js-cookie";
import {
  MessageCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
  LogOut,
  UsersRound,
  UserRoundPlus,
  CircleFadingPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSwitcher } from "./account-switcher";
import { MailDisplay } from "./mail-display";
import { MailList } from "./mail-list";
import { type Mail } from "../data";
import { useMail } from "../use-mail";
import { Nav } from "./nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGlobalContext } from "@/utils/globalContext";
import AvatarIcon from "@/components/chatComponents/AvatarIcon";
import Image from "next/image";

interface MailProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  mails: Mail[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function Mail({
  accounts,
  mails,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [mail] = useMail();
  const { Groups, Contacts, Chats, Story, configs, data, title, setTitle } =
    useGlobalContext();

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes
          )}`;
        }}
        className="h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`;
          }}
          onResize={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          {/* <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div> */}

          {/* <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "JersApp",
                label: "",
                icon: MessageCircle,
                variant: "ghost",
              },
            ]}
          /> */}
          <div className="p-2 flex items-center justify-center ">
            {isCollapsed ? (
              <AvatarIcon src={"/JersApp Icon.png"} name="JersApp" />
            ) : (
              <Image alt="JersApp" src={"/Logo.png"} height="100" width="100" />
            )}
            {/* {!isCollapsed && (
              <p className="font-bold text-[25px] text-[#4954ec]">ersApp</p>
            )} */}
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Chats",
                label: Chats?.length > 0 ? Chats?.length : "",
                icon: MessageCircle,
                variant: "default",
              },
              {
                title: "Groups",
                label: Groups?.length > 0 ? Groups?.length : "",
                icon: UsersRound,
                variant: "ghost",
              },
              {
                title: "Story",
                label: Story?.length > 0 ? Story?.length : "",
                icon: CircleFadingPlus,
                variant: "ghost",
              },
              {
                title: "Contacts",
                label: Contacts?.length > 0 ? Contacts?.length : "",
                icon: UserRoundPlus,
                variant: "ghost",
              },
            ]}
            setTitle={setTitle}
            title={title}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Logout",
                label: "",
                icon: LogOut,
                variant: "ghost",
              },
            ]}
            onClick={() => {
              Cookies.remove("JersApp_userData");
              window.location.href = "/";
            }}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-3">
              <h1 className="text-xl font-bold">{title}</h1>
              {/* <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList> */}
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={data} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList items={data?.filter((item: any) => !item?.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <MailDisplay
            mail={
              data?.find((item: any) => item._id === configs?.selected) || null
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
