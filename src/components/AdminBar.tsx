import { logout } from "@/app/login/actions";
import { AdminNav } from "./AdminNav";
import { ProgramBar } from "./SiteChrome";

/** Blue bar with the admin navigation and sign-out. */
export function AdminBar({ user }: { user: string }) {
  return (
    <ProgramBar>
      <AdminNav />
      <form action={logout} className="ml-auto flex items-center gap-3 py-1.5 text-sm">
        <span className="hidden md:inline">
          Signed in as <strong>{user}</strong>
        </span>
        <button type="submit" className="rounded border border-white/60 px-2 py-1 text-white hover:bg-first-blue-dark">
          Sign out
        </button>
      </form>
    </ProgramBar>
  );
}
