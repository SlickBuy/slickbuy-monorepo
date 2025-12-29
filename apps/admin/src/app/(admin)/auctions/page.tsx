"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@auction-platform/ui";
import { useAuctionsList, useDeleteAuction } from "@/hooks/useAuctions";
import { Pagination } from "@/components/Pagination";

interface AuctionRow {
  id: string;
  title: string;
  status: string;
  currentPrice: number;
}

function AuctionsContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.max(1, Number(sp.get("limit") || 20));
  const initialStatus = (sp.get("status") || "all").toLowerCase();
  const initialQuery = sp.get("q") || "";

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string>(initialStatus);
  const [query, setQuery] = useState<string>(initialQuery);

  // Sync local filters with URL changes (e.g., back/forward)
  useEffect(() => {
    const urlStatus = (sp.get("status") || "all").toLowerCase();
    const urlQuery = sp.get("q") || "";
    setStatus(urlStatus);
    setQuery(urlQuery);
  }, [sp]);

  const { data, isLoading } = useAuctionsList({ limit: 1000, status });
  const rows: AuctionRow[] = React.useMemo(
    () => (data?.data ?? []) as AuctionRow[],
    [data]
  );
  const del = useDeleteAuction();

  const filteredRows = useMemo(() => {
    let list = rows;
    if (status !== "all")
      list = list.filter((r) => r.status?.toLowerCase() === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.title?.toLowerCase().includes(q));
    }
    return list;
  }, [rows, status, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
  const start = (page - 1) * limit;
  const pageRows = filteredRows.slice(start, start + limit);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Auctions</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/auctions/new">New Auction</Link>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={!anyChecked || del.isPending}
            onClick={async () => {
              const ids = pageRows
                .filter((r) => selected[r.id])
                .map((r) => r.id);
              for (const id of ids) {
                await del.mutateAsync(id);
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
          <Spinner size="lg" label="Loading auctions..." />
        </div>
      ) : filteredRows.length === 0 ? (
        <p className="text-gray-500">No auctions.</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-md p-1">
              {["all", "active", "scheduled", "ended"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    status === s
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setStatus(s);
                    const params = new URLSearchParams(sp.toString());
                    params.set("status", s);
                    if (query) params.set("q", query);
                    else params.delete("q");
                    params.set("page", "1");
                    router.push(`?${params.toString()}`);
                  }}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex-1 min-w-[220px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const params = new URLSearchParams(sp.toString());
                    params.set("status", status);
                    if (query) params.set("q", query);
                    else params.delete("q");
                    params.set("page", "1");
                    router.push(`?${params.toString()}`);
                  }
                }}
                placeholder="Search by title…"
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white"
              />
            </div>
          </div>
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
                  <th className="text-left px-5 py-3">Title</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Current Price</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.title}`}
                        checked={!!selected[r.id]}
                        onChange={(e) =>
                          setSelected((s) => ({
                            ...s,
                            [r.id]: e.target.checked,
                          }))
                        }
                      />
                    </td>
                    <td className="px-5 py-3">{r.title}</td>
                    <td className="px-5 py-3">
                      {(() => {
                        const s = (r.status || "").toLowerCase();
                        const label =
                          (r.status || "").charAt(0).toUpperCase() +
                          (r.status || "").slice(1).toLowerCase();
                        const color =
                          s === "active"
                            ? "emerald"
                            : s === "scheduled"
                              ? "indigo"
                              : "rose";
                        const fallbackClass =
                          s === "active"
                            ? "ui-safelist-badge-emerald-soft"
                            : s === "scheduled"
                              ? "ui-safelist-badge-indigo-soft"
                              : "ui-safelist-badge-rose-soft";
                        return (
                          <Badge
                            size="sm"
                            variant="soft"
                            color={color as "emerald" | "indigo" | "rose"}
                            className={fallbackClass}
                          >
                            {label}
                          </Badge>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3">
                      ${Number(r.currentPrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/auctions/${r.id}`}>View</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={del.isPending}
                          onClick={() => del.mutateAsync(r.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              const params = new URLSearchParams(sp.toString());
              params.set("page", String(p));
              params.set("limit", String(limit));
              params.set("status", status);
              if (query) params.set("q", query);
              else params.delete("q");
              router.push(`?${params.toString()}`);
            }}
          />
        </>
      )}
    </div>
  );
}

export default function AdminAuctionsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Auctions</h1>
          </div>
          <div className="flex items-center justify-center py-10">
            <Spinner size="lg" label="Loading auctions..." />
          </div>
        </div>
      }
    >
      <AuctionsContent />
    </Suspense>
  );
}
