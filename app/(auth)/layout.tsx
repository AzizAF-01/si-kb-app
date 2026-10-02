import Link from "next/link";
import { HeartPulse } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md">
          <HeartPulse className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">SI-KB</span>
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        {children}
      </div>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        © 2026 SI-KB. Edukasi kesehatan reproduksi.
      </div>
    </div>
  );
}
