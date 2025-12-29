"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={scrollUp}
        size="icon"
        className="rounded-full shadow-lg bg-gradient-to-r from-teal-600 to-teal-800"
        aria-label="Scroll to top"
        title="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M12 4.5a.75.75 0 01.53.22l6 6a.75.75 0 11-1.06 1.06L12.75 6.81V19.5a.75.75 0 11-1.5 0V6.81l-4.72 4.97a.75.75 0 11-1.06-1.06l6-6A.75.75 0 0112 4.5z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </div>
  );
}
