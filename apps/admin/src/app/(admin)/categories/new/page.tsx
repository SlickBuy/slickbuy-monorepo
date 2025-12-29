"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// import { adminApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@auction-platform/ui";
import { Spinner } from "@/components/ui/spinner";
import { categoryCreateSchema } from "@/lib/schemas/category";
import { useCreateCategory } from "@/hooks/useCategories";

export default function AdminNewCategoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const create = useCreateCategory();
  const saving = create.isPending;

  const { show } = useToast();
  const errors = useMemo(() => {
    const parsed = categoryCreateSchema.safeParse(
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

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const mark = (name: string) => setTouched((p) => ({ ...p, [name]: true }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        parentId: form.parentId || undefined,
      };
      const resp = await create.mutateAsync(payload);
      if (resp?.success) {
        show("Category created", "success");
        router.push("/categories?created=1");
      } else {
        setError(resp?.message || "Failed to create category");
        show(resp?.message || "Failed to create category", "error");
      }
    } catch (err: unknown) {
      let message = "Failed to create category";
      if (err && typeof err === "object" && "message" in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === "string") message = m;
      }
      setError(message);
      show(message, "error");
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        New Category
      </h1>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          {saving && (
            <div className="flex items-center">
              <Spinner label="Creating category..." />
            </div>
          )}
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            onBlur={() => mark("name")}
            error={touched.name ? errors.name : ""}
            required
            disabled={saving}
          />
          <Input
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={onChange}
            onBlur={() => mark("slug")}
            helperText="lowercase-words-separated-by-dashes"
            error={touched.slug ? errors.slug : ""}
            required
            disabled={saving}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              disabled={saving}
            />
          </div>
          <Input
            label="Parent Category ID (optional)"
            name="parentId"
            value={form.parentId}
            onChange={onChange}
            disabled={saving}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 items-center pt-2">
            <Button type="submit" isLoading={saving}>
              Create Category
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
      </Card>
    </div>
  );
}
