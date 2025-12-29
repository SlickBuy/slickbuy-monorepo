"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@auction-platform/ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { show } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await adminApi.post("/auth/login", { email, password });
      if (resp.data?.success && resp.data?.data) {
        const auth: { token?: string; accessToken?: string } = resp.data.data;
        const jwt = auth.token || auth.accessToken;
        if (jwt) {
          localStorage.setItem("auction_token", jwt);
        }
        show("Login successful", "success");
        // Navigate to dashboard; use multiple strategies to ensure redirect
        try {
          router.replace("/");
          router.refresh();
        } finally {
          // Fallback for cases where client router doesn't update immediately
          setTimeout(() => {
            if (window.location.pathname === "/login") {
              window.location.assign("/");
            }
          }, 100);
        }
      } else {
        setError(resp.data?.message || "Invalid credentials");
        show(resp.data?.message || "Invalid credentials", "error");
      }
    } catch (err: unknown) {
      let message = "Login failed";
      if (err && typeof err === "object") {
        const maybe = err as { response?: { data?: { message?: string } } };
        message = maybe.response?.data?.message || message;
      }
      setError(message);
      show(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="p-6">
        <form onSubmit={submit} className="w-80 space-y-5">
          <h1 className="text-xl font-semibold text-gray-900">Admin Login</h1>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" isLoading={loading} fullWidth>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
