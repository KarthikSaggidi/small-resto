import SuperAdminLogin from "@/components/super-admin/SuperAdminLogin";
import SuperAdminShell from "@/components/super-admin/SuperAdminShell";
import { getSuperAdminSession } from "@/lib/auth/super-admin-session";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSuperAdminSession();

  if (!session) {
    return <SuperAdminLogin />;
  }

  return <SuperAdminShell>{children}</SuperAdminShell>;
}