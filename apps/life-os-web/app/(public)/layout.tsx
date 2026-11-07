import { PublicOnly } from "@/components/auth/PublicOnly";
import { Providers } from "../providers";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <PublicOnly>{children}</PublicOnly>
    </Providers>
  );
}
