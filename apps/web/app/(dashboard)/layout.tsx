import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WorkspaceSwitcher } from "../../components/workspace-switcher";
import { DirtyStateProvider } from "../../components/dirty-state-provider";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <DirtyStateProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              Shipflow
            </Link>
            
            <div className="h-4 w-px bg-gray-200" />
            
            <WorkspaceSwitcher />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </DirtyStateProvider>
  );
}
