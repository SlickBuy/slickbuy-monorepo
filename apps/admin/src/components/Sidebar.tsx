"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Gavel,
  Users as UsersIcon,
  ReceiptText,
  Tags,
  LogOut,
} from "lucide-react";
import { useToast } from "@auction-platform/ui";

export const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const { show } = useToast();

  const handleLogout = () => {
    try {
      localStorage.removeItem("auction_token");
      localStorage.removeItem("auction_user");
    } catch {}
    show("Logged out", "success");
    router.push("/login");
  };
  return (
    <>
      {/* Floating round toggle button; the only visible element when closed */}
      <Button
        variant="default"
        size="sm"
        className="fixed bottom-4 left-3 z-50 h-9 w-9 p-0 rounded-full shadow-md"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </Button>

      <aside
        className={
          "sticky top-0 h-[100dvh] overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-in-out " +
          (open
            ? "w-64 bg-white border-r border-gray-200"
            : "w-0 bg-transparent border-0")
        }
      >
        <div
          className={
            "transition-all duration-300 " +
            (open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")
          }
        >
          <div className="h-full flex flex-col pb-24">
            <div className="p-3">
              <div className="font-bold text-gray-900 truncate">
                Slick Buy Admin
              </div>
            </div>
            <nav className="px-2 py-2 space-y-1">
              <Link
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                href="/"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                href="/auctions"
              >
                <Gavel size={16} />
                <span>Auctions</span>
              </Link>
              <Link
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                href="/users"
              >
                <UsersIcon size={16} />
                <span>Users</span>
              </Link>
              <Link
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                href="/bids"
              >
                <ReceiptText size={16} />
                <span>Bids</span>
              </Link>
              <div className="pt-2 mt-2 border-t border-gray-200" />
              <Link
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                href="/categories"
              >
                <Tags size={16} />
                <span>Categories</span>
              </Link>
              {/* New Category button removed per request */}
            </nav>
            <div className="mt-auto px-3 py-3 border-t border-gray-200 mb-4 absolute bottom-0 w-full">
              <Button
                variant="default"
                className="w-full justify-center"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
