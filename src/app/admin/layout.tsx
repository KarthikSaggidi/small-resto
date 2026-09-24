import AdminShell from "@/components/admin/AdminShell";
import AdminLoginModal from "@/components/admin/AdminLoginModal";
import { getAdminSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLoginModal />;
  }

  return <AdminShell>{children}</AdminShell>;
}