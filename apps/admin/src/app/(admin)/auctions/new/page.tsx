"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";
import { auctionCreateSchema } from "@/lib/schemas/auction";
import { useCategories } from "@/hooks/useCategories";
import { Spinner } from "@/components/ui/spinner";

export default function AdminNewAuctionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    images: "",
    startingPrice: "",
    reservePrice: "",
    startTime: "",
    endTime: "",
    categoryId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const [uploading, setUploading] = useState(false);
  const { data: catData, isLoading: catsLoading } = useCategories();

  useEffect(() => {
    const rows = (catData?.data ?? []) as Array<{ id: string; name: string }>;
    if (!form.categoryId && rows.length > 0) {
      setForm((prev) => ({ ...prev, categoryId: rows[0].id }));
    }
  }, [catData, form.categoryId]);

  const setField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const markTouched = (name: string) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const fieldErrors = useMemo(() => {
    const parsed = auctionCreateSchema.safeParse(
      form as Record<string, unknown>
    );
    if (parsed.success) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!map[key]) map[key] = issue.message;
    }
    return map;
  }, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      title: true,
      description: true,
      images: true,
      startingPrice: true,
      reservePrice: true,
      startTime: true,
      endTime: true,
      categoryId: true,
    });
    if (Object.keys(fieldErrors).length) return;

    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        images: form.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        startingPrice: Number(form.startingPrice),
        reservePrice: form.reservePrice ? Number(form.reservePrice) : undefined,
        startTime: new Date(form.startTime),
        endTime: new Date(form.endTime),
        categoryId: form.categoryId || "general",
      };

      const resp = await adminApi.post("/auctions", payload);
      if (resp.data?.success && resp.data?.data?.id) {
        router.push(`/auctions/${resp.data.data.id}`);
      } else {
        setError(resp.data?.message || "Failed to create auction");
      }
    } catch (err: unknown) {
      let message = "Failed to create auction";
      if (err && typeof err === "object" && "message" in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === "string") message = m;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Auction</h1>
        <p className="text-gray-600 mt-1">
          Create a new product listing for the marketplace.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6">
        {/* Details */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={setField}
                onBlur={() => markTouched("title")}
                placeholder="e.g., Vintage Camera Model X"
                error={touched.title ? fieldErrors.title : ""}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={setField}
                  onBlur={() => markTouched("description")}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    touched.description && fieldErrors.description
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Describe the item, condition, and details buyers need to know"
                  required
                />
                {touched.description && fieldErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              <Input
                label="Image URLs"
                name="images"
                value={form.images}
                onChange={setField}
                onBlur={() => markTouched("images")}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                helperText="Separate multiple image URLs with commas"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Or upload images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const inputEl = e.currentTarget as HTMLInputElement | null;
                    const files = inputEl?.files
                      ? Array.from(inputEl.files)
                      : [];
                    if (!files.length) return;
                    setUploading(true);
                    try {
                      const uploaded: string[] = [];
                      const apiRoot = apiBase.replace(/\/api$/, "");
                      for (const f of files) {
                        const res = await uploadImage(f, apiBase);
                        uploaded.push(`${apiRoot}${res.path}`);
                      }
                      const existing = form.images
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const combined = [...existing, ...uploaded].join(", ");
                      setForm((prev) => ({ ...prev, images: combined }));
                    } catch (err) {
                      setError("Image upload failed");
                    } finally {
                      setUploading(false);
                      if (inputEl) inputEl.value = "";
                    }
                  }}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {uploading && (
                  <p className="text-sm text-gray-500">Uploading...</p>
                )}
              </div>

              {/* Preview grid */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {form.images
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((src, idx) => (
                      <div
                        key={`${src}-${idx}`}
                        className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                      >
                        <img
                          src={src}
                          alt={`upload-${idx}`}
                          className="w-full h-28 object-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Pricing */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Pricing</h2>
              <Input
                label="Starting Price"
                type="number"
                name="startingPrice"
                value={form.startingPrice}
                onChange={setField}
                onBlur={() => markTouched("startingPrice")}
                placeholder="0.00"
                error={touched.startingPrice ? fieldErrors.startingPrice : ""}
                required
              />
              <Input
                label="Reserve Price (optional)"
                type="number"
                name="reservePrice"
                value={form.reservePrice}
                onChange={setField}
                placeholder="Leave blank if no reserve"
              />
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Schedule</h2>
              <Input
                label="Start Time"
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={setField}
                onBlur={() => markTouched("startTime")}
                error={touched.startTime ? fieldErrors.startTime : ""}
                required
              />
              <Input
                label="End Time"
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={setField}
                onBlur={() => markTouched("endTime")}
                error={touched.endTime ? fieldErrors.endTime : ""}
                required
              />
            </div>
          </Card>

          {/* Category */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Category</h2>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">
                  Category
                </label>
                {catsLoading ? (
                  <Spinner label="Loading categories..." />
                ) : (
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className="flex h-9 w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border border-input"
                    required
                  >
                    {(catData?.data ?? []).map(
                      (c: { id: string; name: string }) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>
            </div>
          </Card>
        </div>

        {error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <div className="flex gap-3 items-center">
          <Button type="submit" isLoading={saving}>
            Create Auction
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
