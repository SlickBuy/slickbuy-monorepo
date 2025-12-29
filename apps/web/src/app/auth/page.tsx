"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "register") setActiveTab("register");
    else setActiveTab("login");
  }, [searchParams]);
  // old inline forms removed; using separate components

  return (
    <div
      className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url(/auth-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        objectFit: "contain",
      }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative max-w-md w-full">
        <div className="text-center mb-8 text-white">
          <h2 className="text-3xl font-bold">Welcome</h2>
          <p className="mt-2 opacity-90">Sign in or create your account</p>
        </div>

        <div
          className="flex gap-2 mb-4"
          role="tablist"
          aria-label="Authentication"
        >
          <button
            role="tab"
            aria-selected={activeTab === "login"}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === "login"
                ? "bg-card text-gray-900 shadow"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => router.push("/auth?tab=login")}
          >
            Login
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "register"}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === "register"
                ? "bg-card text-gray-900 shadow"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => router.push("/auth?tab=register")}
          >
            Register
          </button>
        </div>

        <Card className="p-6 card-dark">
          {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-white/80 hover:opacity-90">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
