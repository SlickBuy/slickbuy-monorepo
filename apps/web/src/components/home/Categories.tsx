"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

type Category = { id: string; name: string; description?: string };

export function CategoriesSection({
  categories,
  isLoading,
}: {
  categories: Category[];
  isLoading: boolean;
}) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Browse by Category
            </h2>
            <p className="text-gray-600">
              Find items in the categories you love.
            </p>
          </div>
          <Link href="/auctions" className="hidden md:block">
            <span className="inline-flex items-center rounded-md bg-[color:var(--success)] text-white px-4 py-2 text-sm shadow-sm">
              View All
            </span>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {[...Array(4)].map((_, i) => (
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
                <Card className="p-6 hover:shadow-md transition-shadow h-full">
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
    </section>
  );
}
