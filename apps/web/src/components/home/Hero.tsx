"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setOffsetY(window.scrollY || 0);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const bgStyle: React.CSSProperties = {
    backgroundImage: "url(/home-hero.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const contentStyle: React.CSSProperties = {
    transform: `translateY(${offsetY * -0.25}px)`,
    willChange: "transform",
  };

  return (
    <section
      className="relative text-white py-24 md:py-28 min-h-[70vh]"
      aria-label="Hero"
    >
      <div className="absolute inset-0" style={bgStyle} />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center" style={contentStyle}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Discover Unique Items at
            <span className="block text-white drop-shadow-lg">Slick Buy</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto drop-shadow">
            Join thousands of collectors and enthusiasts in our online auction
            marketplace. Find rare items, antiques, and one-of-a-kind treasures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auctions">
              <Button size="lg" variant="secondary" className="text-gray-900">
                Browse Auctions
              </Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button
                size="lg"
                variant="ghost"
                className="text-white border-white hover:bg-white hover:text-teal-700"
              >
                Start Bidding
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
