import { AdminBar } from "@/components/AdminBar";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { isLocalDatabaseUrl } from "@/db";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const user = await requireAdmin();
  const testDatabase = isLocalDatabaseUrl(process.env.DATABASE_URL);
  return (
    <>
      {testDatabase && (
        <div className="bg-ftc px-4 py-1 text-center text-sm font-semibold text-white">
          TEST DATABASE: changes here don&apos;t affect the live site.
        </div>
      )}
      {!testDatabase && process.env.NODE_ENV === "development" && (
        <div className="bg-danger px-4 py-1 text-center text-sm font-semibold text-white">
          LIVE DATABASE: changes here change the real data.
        </div>
      )}
      <SiteHeader />
      <AdminBar user={user} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-5">{children}</main>
      <SiteFooter />
    </>
  );
}
