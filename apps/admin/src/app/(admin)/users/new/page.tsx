"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@auction-platform/ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateUser } from "@/hooks/useUsers";
import { Spinner } from "@/components/ui/spinner";
import { UserRole } from "@auction-platform/types";

export default function AdminNewUserPage() {
  const router = useRouter();
  const create = useCreateUser();
  const { show } = useToast();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    role: "user" as UserRole,
    password: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      try {
        await create.mutateAsync(form);
        show("User created", "success");
        router.push("/users");
      } catch (e: unknown) {
        const message =
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Failed to create user";
        show(message, "error");
      }
    } catch (err: unknown) {
      let message = "Failed to create user";
      if (err && typeof err === "object") {
        const maybeAxios = err as {
          response?: { data?: { message?: string }; status?: number };
        };
        message =
          maybeAxios.response?.data?.message ||
          (maybeAxios.response?.status === 409
            ? "Email or username already in use"
            : message);
      }
      setError(message);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Create User</h1>
      <Card>
        <form onSubmit={submit} className="p-6 space-y-4">
          {create.isPending && (
            <div className="flex items-center justify-start">
              <Spinner label="Creating user..." />
            </div>
          )}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <Input
            label="Role"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as UserRole })
            }
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.back()}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={create.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
