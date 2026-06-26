"use client";

import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  
  return (
    <button 
      onClick={async (e) => {
        e.stopPropagation();
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/auth");
              router.refresh();
            }
          }
        });
      }}
      className="p-1.5 rounded-md text-[#71717a] hover:text-red-400 hover:bg-white/[0.05] transition-colors"
      title="Log out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
