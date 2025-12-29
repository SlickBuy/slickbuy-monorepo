"use client";

import React from "react";
import { ReactQueryProvider } from "@/lib/queryClient";
import { ToastProvider } from "@auction-platform/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </ReactQueryProvider>
  );
}
