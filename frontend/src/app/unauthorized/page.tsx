import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 font-sans page-gradient">
      <div
        className="text-center p-10 border-[3px] border-black dark:border-[#222] bg-white dark:bg-[#141414] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none max-w-md w-full mx-6"
        style={{ borderRadius: "32px" }}
      >
        <h1 className="text-7xl font-black uppercase tracking-tighter mb-2 text-black dark:text-[#f0f0f0]">
          403
        </h1>
        <p className="text-[#EF9D39] font-black uppercase tracking-widest text-sm mb-4">
          Access Denied
        </p>
        <p className="text-gray-500 dark:text-[#888] text-sm font-medium mb-8">
          You don't have permission to view this page.
        </p>
        <Link
          href="/"
          className="inline-block bg-black dark:bg-[#EF9D39] text-white dark:text-black px-8 py-3 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#EF9D39] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(239,157,57,0.5)] dark:shadow-none"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}