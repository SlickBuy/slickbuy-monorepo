"use client";

// This component exists solely to ensure Tailwind generates the badge color utilities
// that are referenced inside the shared `@auction-platform/ui` package.
// It is never rendered, but Tailwind scans it during build.
export default function _TwBadgeSafelist() {
  return (
    <div className="hidden">
      {/* green */}
      <span className="text-green-800 bg-green-100" />
      <span className="text-white bg-green-600" />
      <span className="text-green-700" />
      {/* emerald */}
      <span className="text-emerald-800 bg-emerald-100" />
      <span className="text-white bg-emerald-600" />
      <span className="text-emerald-700" />
      {/* red */}
      <span className="text-red-800 bg-red-100" />
      <span className="text-white bg-red-600" />
      <span className="text-red-700" />
      {/* rose */}
      <span className="text-rose-800 bg-rose-100" />
      <span className="text-white bg-rose-600" />
      <span className="text-rose-700" />
      {/* blue */}
      <span className="text-blue-800 bg-blue-100" />
      <span className="text-white bg-blue-600" />
      <span className="text-blue-700" />
      {/* sky */}
      <span className="text-sky-800 bg-sky-100" />
      <span className="text-white bg-sky-600" />
      <span className="text-sky-700" />
      {/* indigo */}
      <span className="text-indigo-800 bg-indigo-100" />
      <span className="text-white bg-indigo-600" />
      <span className="text-indigo-700" />
      {/* gray */}
      <span className="text-gray-700 bg-gray-100" />
      <span className="text-white bg-gray-700" />
    </div>
  );
}
