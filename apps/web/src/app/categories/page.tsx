"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { categoriesAPI } from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await categoriesAPI.getCategories();
        if (resp.data?.success) setCategories(resp.data.data || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen py-16 bg-[color:var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse by Category
          </h1>
          <p className="text-[color:var(--muted-foreground)]">
            Find items in the categories you love.
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-lg border border-[color:var(--card-border)] shadow-sm animate-pulse"
              >
                <div className="h-6 w-16 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/auctions?category=${c.id}`}
                className="block h-full"
              >
                <Card className="p-6 hover:shadow-md transition-shadow bg-white h-full">
                  <div className="text-3xl mb-3">📦</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {c.name}
                  </h3>
                  {c.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
