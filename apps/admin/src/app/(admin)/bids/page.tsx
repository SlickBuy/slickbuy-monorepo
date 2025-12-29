"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useBids, useDeleteBid } from "@/hooks/useBids";
import { Pagination } from "@/components/Pagination";

interface Row {
  id: string;
  amount: number;
  placedAt: string;
  status?: string;
  auction?: { id: string; title: string };
  bidder?: { id: string; email: string };
}

function BidsContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.max(1, Number(sp.get("limit") || 20));
  const { data, isLoading } = useBids({ limit: 1000 });
  const rows: Row[] = (data?.data ?? []) as Row[];
  const del = useDeleteBid();

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Bids</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="lg"
            disabled={!anyChecked || del.isPending}
            onClick={async () => {
              const ids = pageRows
                .filter((r) => selected[r.id])
                .map((r) => r.id);
              for (const id of ids) await del.mutateAsync(id);
              setSelected({});
            }}
          >
            {`Delete (${selectedCount})`}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" label="Loading bids..." />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <p className="text-gray-500 p-4">No bids.</p>
        </Card>
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
                  <th className="text-left px-5 py-3">Auction</th>
                  <th className="text-left px-5 py-3">Bidder</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Placed</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select bid ${r.id}`}
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
                      {r.auction?.title ? (
                        <Link
                          className="text-blue-600 hover:underline"
                          href={`/auctions/${r.auction.id}`}
                        >
                          {r.auction.title}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {r.bidder?.email ? (
                        <Link
                          className="text-blue-600 hover:underline"
                          href={`/users/${r.bidder.id}`}
                        >
                          {r.bidder.email}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      ${Number(r.amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      {new Date(r.placedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 capitalize">{r.status || ""}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center gap-2 justify-end">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/auctions/${r.auction?.id}`}>
                            View Auction
                          </Link>
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
            onPageChange={(p) => router.push(`?page=${p}&limit=${limit}`)}
          />
        </>
      )}
    </div>
  );
}

export default function AdminBidsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Bids</h1>
          </div>
          <div className="flex items-center justify-center py-10">
            <Spinner size="lg" label="Loading bids..." />
          </div>
        </div>
      }
    >
      <BidsContent />
    </Suspense>
  );
}
