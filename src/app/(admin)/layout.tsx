import { AdminBar } from "@/components/AdminBar";
import { MockupBanner, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const user = await requireAdmin();
  return (
    <>
      <SiteHeader />
      <AdminBar user={user} />
      <MockupBanner />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-5">{children}</main>
      <SiteFooter />
    </>
  );
}
