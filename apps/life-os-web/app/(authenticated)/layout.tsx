import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { Providers } from "../providers";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <RequireAuth>
        <div className="min-h-screen bg-black text-white">
          <AppTopNav />
          <div className="mx-auto w-full max-w-5xl px-5 py-6">{children}</div>
        </div>
      </RequireAuth>
    </Providers>
  );
}
