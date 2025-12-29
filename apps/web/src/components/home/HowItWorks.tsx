"use client";

import { Card } from "@/components/ui/card";

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            How it works
          </h2>
          <p className="text-gray-600">Start bidding in 3 simple steps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Create an account",
              desc: "Sign up to track bids and save favorites.",
              icon: (
                <svg
                  className="w-8 h-8 text-teal-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ),
            },
            {
              title: "Browse auctions",
              desc: "Discover items across curated categories.",
              icon: (
                <svg
                  className="w-8 h-8 text-teal-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              ),
            },
            {
              title: "Place your bid",
              desc: "Bid in real-time and win your item.",
              icon: (
                <svg
                  className="w-8 h-8 text-teal-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A2 2 0 0122 9.528V14.5a2 2 0 01-1.106 1.789L15 19M4 6h7M4 10h7M4 14h7"
                  />
                </svg>
              ),
            },
          ].map((s, i) => (
            <Card key={i} className="p-6 bg-white">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {s.title}
              </h3>
              <p className="text-gray-600 text-sm">{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
