import { RequireAuth } from "@/components/auth/RequireAuth";
import { Providers } from "../providers";
import "./resume-builder.css";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <RequireAuth>
        <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#e4e7ec] font-sans text-neutral-900">
          {children}
        </div>
      </RequireAuth>
    </Providers>
  );
}
