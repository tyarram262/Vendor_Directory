import Link from "next/link";
import { logout } from "@/lib/actions/auth";

// Everything under this route group is already gated by src/proxy.ts before
// it renders, so no auth check needed here — just the shared chrome.
// /admin/login sits outside the group and doesn't get this nav.
export default function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <nav className="flex items-center gap-4 text-sm font-medium text-foreground">
            <span className="text-muted">Admin</span>
            <Link href="/admin/inquiries" className="hover:underline">
              Inquiries
            </Link>
            <Link href="/admin/vendors" className="hover:underline">
              Vendors
            </Link>
          </nav>
          <form action={logout}>
            <button type="submit" className="text-sm text-muted underline hover:text-foreground">
              Log out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
