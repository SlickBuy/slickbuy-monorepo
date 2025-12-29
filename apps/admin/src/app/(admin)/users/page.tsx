"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useUsers } from "@/hooks/useUsers";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import type { User } from "@auction-platform/types";

function UsersContent() {
  const sp = useSearchParams();
  const page = Number(sp.get("page") ?? 1);
  const limit = Number(sp.get("limit") ?? 20);
  const { data, isLoading } = useUsers(page, limit);
  const rows = useMemo(() => (data?.data ?? []) as User[], [data?.data]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allChecked = useMemo(
    () => rows.length > 0 && rows.every((r) => !!selected[r.id]),
    [rows, selected]
  );
  const selectedCount = useMemo(
    () => rows.filter((r) => selected[r.id]).length,
    [rows, selected]
  );
  const anyChecked = selectedCount > 0;
  const toggleAll = () => {
    const target = !allChecked;
    const next: Record<string, boolean> = {};
    for (const r of rows) next[r.id] = target;
    setSelected(next);
  };
  const pagination = data?.pagination ?? { page: 1, totalPages: 1 };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/users/new">New User</Link>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={!anyChecked}
            onClick={() => {
              // wire to bulk delete when API is ready
              const ids = rows.filter((r) => selected[r.id]).map((r) => r.id);
              console.log("bulk delete users", ids);
              setSelected({});
            }}
          >
            {`Delete (${selectedCount})`}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" label="Loading users..." />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <p className="text-gray-500 p-4">No users.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="px-5 py-3 w-8">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allChecked}
                    onChange={toggleAll}
                  />
                </th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Username</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${u.email}`}
                      checked={!!selected[u.id]}
                      onChange={(e) =>
                        setSelected((s) => ({ ...s, [u.id]: e.target.checked }))
                      }
                    />
                  </td>
                  <td className="px-5 py-3">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3">{u.username}</td>
                  <td className="px-5 py-3 capitalize">{u.role}</td>
                  <td className="px-5 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/users/${u.id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) =>
          (window.location.href = `?page=${p}&limit=${limit}`)
        }
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          </div>
          <div className="flex items-center justify-center py-10">
            <Spinner size="lg" label="Loading users..." />
          </div>
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
