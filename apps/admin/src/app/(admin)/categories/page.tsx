"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCategories,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@auction-platform/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/Pagination";

function CategoriesContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.max(1, Number(sp.get("limit") || 20));
  // Show toast if redirected after create
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("created") === "1") {
        try {
          (async () => {
            // We cannot call hooks conditionally; fire a custom event consumed by provider
            window.dispatchEvent(
              new CustomEvent("__ap_toast__", {
                detail: { message: "Category created", type: "success" },
              })
            );
          })();
        } catch {}
        url.searchParams.delete("created");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);
  const { data, isLoading } = useCategories();
  const del = useDeleteCategory();
  const update = useUpdateCategory();
  const { show } = useToast();
  const rows = React.useMemo(
    () =>
      (data?.data ?? []) as Array<{
        id: string;
        name: string;
        slug: string;
        createdAt: string;
      }>,
    [data]
  );

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const totalPages = Math.max(1, Math.ceil(rows.length / limit));
  const start = (page - 1) * limit;
  const pageRows = rows.slice(start, start + limit);
  const allChecked = useMemo(
    () => pageRows.length > 0 && pageRows.every((r) => !!selected[r.id]),
    [pageRows, selected]
  );
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );
  const anyChecked = selectedCount > 0;
  const toggleAll = () => {
    const target = !allChecked;
    setSelected((prev) => {
      const next = { ...prev } as Record<string, boolean>;
      for (const r of pageRows) next[r.id] = target;
      return next;
    });
  };

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const startEdit = (row: { id: string; name: string; slug: string }) => {
    setEditId(row.id);
    setEditName(row.name);
    setEditSlug(row.slug);
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditSlug("");
  };
  const saveEdit = async () => {
    if (!editId) return;
    await update
      .mutateAsync({ id: editId, data: { name: editName, slug: editSlug } })
      .then(() => show("Category updated", "success"))
      .catch((e: unknown) => {
        const msg = (e as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        show(msg || "Failed to update", "error");
      });
    cancelEdit();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/categories/new">New Category</Link>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={!anyChecked || del.isPending}
            onClick={async () => {
              const ids = rows.filter((r) => selected[r.id]).map((r) => r.id);
              let successCount = 0;
              for (const id of ids) {
                try {
                  await del.mutateAsync(id);
                  successCount++;
                } catch (e) {
                  const msg = (
                    e as { response?: { data?: { message?: string } } }
                  )?.response?.data?.message;
                  show(msg || "Failed to delete", "error");
                }
              }
              if (successCount > 0) {
                show(
                  `Deleted ${successCount} ${successCount === 1 ? "category" : "categories"}`,
                  "success"
                );
              }
              setSelected({});
            }}
          >
            {`Delete (${selectedCount})`}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" label="Loading categories..." />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Card>
            <p className="text-gray-500 px-6 py-4">No categories yet.</p>
          </Card>
          <div className="mt-6">
            <Button asChild>
              <Link href="/categories/new">Create Category</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
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
                  <th className="text-left px-5 py-3">Slug</th>
                  <th className="text-left px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.name}`}
                        checked={!!selected[r.id]}
                        onChange={(e) =>
                          setSelected((s) => ({
                            ...s,
                            [r.id]: e.target.checked,
                          }))
                        }
                      />
                    </td>
                    <td className="px-5 py-3">
                      {editId === r.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        r.name
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editId === r.id ? (
                        <Input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                        />
                      ) : (
                        r.slug
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {editId === r.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={update.isPending}
                            isLoading={update.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={cancelEdit}
                            disabled={update.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => startEdit(r)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmId(r.id)}
                            disabled={del.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => router.push(`?page=${p}&limit=${limit}`)}
          />
          <Dialog
            open={!!confirmId}
            onOpenChange={(open: boolean) => !open && setConfirmId(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete category</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this category? This action
                cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setConfirmId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  isLoading={del.isPending}
                  disabled={del.isPending}
                  onClick={async () => {
                    if (!confirmId) return;
                    await del
                      .mutateAsync(confirmId)
                      .then(() => show("Category deleted", "success"))
                      .catch(
                        (e: { response?: { data?: { message?: string } } }) =>
                          show(
                            e?.response?.data?.message || "Failed to delete",
                            "error"
                          )
                      );
                    setConfirmId(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          </div>
          <div className="flex items-center justify-center py-10">
            <Spinner size="lg" label="Loading categories..." />
          </div>
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
