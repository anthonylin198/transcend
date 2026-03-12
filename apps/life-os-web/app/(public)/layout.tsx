import { PublicOnly } from "@/components/auth/PublicOnly";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicOnly>{children}</PublicOnly>;
}
