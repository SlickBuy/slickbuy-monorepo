"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { bidsAPI, api } from "@/lib/api";
import { useToast } from "@auction-platform/ui";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { show } = useToast();
  type UserBid = {
    id: string;
    auctionId: string;
    amount: number;
    createdAt: string;
    isWinning?: boolean;
    auction?: { title?: string; images?: string[] };
  };
  const [bids, setBids] = useState<UserBid[]>([]);
  const [wonItems, setWonItems] = useState<UserBid[]>([]);
  const [loadingBids, setLoadingBids] = useState<boolean>(true);
  const [savingAccount, setSavingAccount] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);
  const [accountForm, setAccountForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [prefs, setPrefs] = useState({
    emailUpdates: true,
    outbidAlerts: true,
    endingSoon: true,
  });

  const currentTab = (searchParams.get("tab") || "overview") as
    | "overview"
    | "bids"
    | "won"
    | "settings";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth?tab=login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadBids = async () => {
      try {
        const resp = await bidsAPI.getMyBids({ limit: 20 });
        if (resp.data?.success) {
          const list = (resp.data.data as UserBid[]) || [];
          setBids(list);
          const winners = list.filter((b: UserBid) => b.isWinning);
          const byAuction: Record<string, UserBid> = {};
          for (const b of winners) {
            const existing = byAuction[b.auctionId];
            if (!existing || Number(b.amount) > Number(existing.amount)) {
              byAuction[b.auctionId] = b;
            }
          }
          setWonItems(Object.values(byAuction));
        }
      } finally {
        setLoadingBids(false);
      }
    };
    if (isAuthenticated) loadBids();
  }, [isAuthenticated]);

  const stats = useMemo(() => {
    const total = bids.length;
    const totalWon = bids.filter((b) => b.isWinning).length;
    const totalAmount = bids.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    return { total, totalWon, totalAmount };
  }, [bids]);

  if (isLoading || (!isAuthenticated && typeof window !== "undefined")) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-40 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-800 animate-pulse" />
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="h-72 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-72 rounded-xl bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                {user?.firstName?.[0] || user?.email?.[0] || "B"}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {user?.firstName || "Bidder"} {user?.lastName || ""}
                </h1>
                <p className="text-teal-100 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link
              href="/profile?tab=overview"
              className={`px-4 py-3 text-sm rounded-t-md border-b-2 transition-colors ${
                currentTab === "overview"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/profile?tab=bids"
              className={`px-4 py-3 text-sm rounded-t-md border-b-2 transition-colors ${
                currentTab === "bids"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200"
              }`}
            >
              My Bids
            </Link>
            <Link
              href="/profile?tab=won"
              className={`px-4 py-3 text-sm rounded-t-md border-b-2 transition-colors ${
                currentTab === "won"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200"
              }`}
            >
              Items Won
            </Link>
            <Link
              href="/profile?tab=settings"
              className={`px-4 py-3 text-sm rounded-t-md border-b-2 transition-colors ${
                currentTab === "settings"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200"
              }`}
            >
              Settings
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      {currentTab === "overview" && (
        <>
          {/* Stats for Overview */}
          <section className="pt-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-5 bg-white">
                  <p className="text-sm text-gray-500">Total Bids</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </Card>
                <Card className="p-5 bg-white">
                  <p className="text-sm text-gray-500">Winning Bids</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-1">
                    {stats.totalWon}
                  </p>
                </Card>
                <Card className="p-5 bg-white">
                  <p className="text-sm text-gray-500">Total Bid Amount</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-1">
                    ${stats.totalAmount.toFixed(2)}
                  </p>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Profile
                  </h2>
                  <Button variant="secondary" size="sm" disabled>
                    Edit
                  </Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                  {user?.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member Since</span>
                      <span className="text-gray-900">
                        {new Date(
                          user.createdAt as unknown as string
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Bids
                  </h2>
                  <Link href="/my-bids">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
                {loadingBids ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : bids.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent bids.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {bids.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        className="py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {b.auction?.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${Number(b.amount).toFixed(2)} •{" "}
                            {new Date(b.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Link href={`/auctions/${b.auctionId}`}>
                          <Button size="sm" variant="secondary">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </section>
        </>
      )}

      {currentTab === "won" && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Items Won
              </h2>
              {loadingBids ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-52 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : wonItems.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No items yet. Keep bidding!
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wonItems.map((w: UserBid) => (
                    <Card key={w.id} className="p-3 bg-white">
                      {w.auction?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={w.auction.images[0]}
                          alt={w.auction?.title || "Item"}
                          className="h-28 w-full object-cover rounded-md mb-3"
                        />
                      )}
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {w.auction?.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Final Bid: ${Number(w.amount).toFixed(0)}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <Link href={`/auctions/${w.auctionId}`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                          >
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="btn-accent w-full"
                          onClick={async () => {
                            try {
                              const resp = await api.post("/payments/create", {
                                userId: user?.id,
                                auctionId: w.auctionId,
                                amountCents: Math.round(Number(w.amount) * 100),
                              });
                              if (resp.data?.success) {
                                const paymentId = resp.data.data.id as string;
                                show("Redirecting to checkout...", "info");
                                window.location.href = `/checkout/${paymentId}`;
                              } else {
                                show(
                                  resp.data?.message ||
                                    "Failed to start checkout",
                                  "error"
                                );
                              }
                            } catch (e) {
                              const err = e as {
                                response?: { data?: { message?: string } };
                              };
                              show(
                                err?.response?.data?.message ||
                                  "Failed to start checkout",
                                "error"
                              );
                            }
                          }}
                        >
                          Pay Now
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>
      )}

      {currentTab === "bids" && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {wonItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Items Won
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wonItems.map((w: UserBid) => (
                    <Card key={w.id} className="p-3 bg-white">
                      {w.auction?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={w.auction.images[0]}
                          alt={w.auction?.title || "Item"}
                          className="h-28 w-full object-cover rounded-md mb-3"
                        />
                      )}
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {w.auction?.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Final Bid: ${Number(w.amount).toFixed(0)}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Bids</h2>
                <Link href="/auctions">
                  <Button variant="ghost" size="sm">
                    Browse Auctions
                  </Button>
                </Link>
              </div>
              {loadingBids ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : bids.length === 0 ? (
                <p className="text-sm text-gray-500">
                  You haven&apos;t placed any bids yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bids.map((b: UserBid) => (
                    <div
                      key={b.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {b.auction?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${Number(b.amount).toFixed(2)} •{" "}
                          {new Date(b.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Link href={`/auctions/${b.auctionId}`}>
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>
      )}

      {currentTab === "settings" && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account
              </h2>
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSavingAccount(true);
                  setTimeout(() => setSavingAccount(false), 800);
                }}
              >
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    placeholder="First name"
                    value={accountForm.firstName}
                    onChange={(e) =>
                      setAccountForm((p) => ({
                        ...p,
                        firstName: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    placeholder="Last name"
                    value={accountForm.lastName}
                    onChange={(e) =>
                      setAccountForm((p) => ({
                        ...p,
                        lastName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={accountForm.email}
                  onChange={(e) =>
                    setAccountForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={savingAccount}>
                    {savingAccount ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Security
              </h2>
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSavingPassword(true);
                  setTimeout(() => setSavingPassword(false), 800);
                }}
              >
                <Input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    type="password"
                    placeholder="New password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={savingPassword}>
                    {savingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="p-6 bg-white md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Notifications
              </h2>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSavingPrefs(true);
                  setTimeout(() => setSavingPrefs(false), 600);
                }}
              >
                <div className="flex items-center justify-between border rounded-md p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email updates
                    </p>
                    <p className="text-xs text-gray-500">
                      Product news and announcements
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={prefs.emailUpdates}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        emailUpdates: e.target.checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between border rounded-md p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Outbid alerts
                    </p>
                    <p className="text-xs text-gray-500">
                      Notify me when someone outbids me
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={prefs.outbidAlerts}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        outbidAlerts: e.target.checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between border rounded-md p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Ending soon
                    </p>
                    <p className="text-xs text-gray-500">
                      Auctions you follow ending in 24h
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={prefs.endingSoon}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, endingSoon: e.target.checked }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={savingPrefs}>
                    {savingPrefs ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="p-6 bg-white md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Danger Zone
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-40 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-800 animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="h-72 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-72 rounded-xl bg-gray-200 animate-pulse" />
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
