"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { useUpdateUser } from "@/hooks/useUsers";
import { Spinner } from "@/components/ui/spinner";
import { UserRole } from "@auction-platform/types";

export default function AdminUserEditPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const update = useUpdateUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    role: "user" as UserRole,
    password: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi.get(`/users/${id}`);
        const u = data?.data || {};
        setForm((p) => ({
          ...p,
          email: u.email || "",
          username: u.username || "",
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          role: (u.role || "user") as UserRole,
        }));
      } catch (e: unknown) {
        const message =
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Failed to fetch user";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await update.mutateAsync({
      id,
      data: { ...form, password: form.password || undefined },
    });
    router.back();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Edit User</h1>
      <Card>
        {loading ? (
          <div className="p-6">
            <Spinner label="Loading user..." />
          </div>
        ) : (
          <form onSubmit={save} className="p-6 space-y-4">
            <Input
              label="Email"
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
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
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
              label="New Password (optional)"
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
                disabled={update.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={update.isPending}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
