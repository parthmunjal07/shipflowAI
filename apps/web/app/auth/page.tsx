"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Box, ArrowRight, Plus } from "lucide-react";
import { authClient, useSession, useListOrganizations } from "../../lib/auth-client";
import { useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: orgs, isPending: orgsLoading } = useListOrganizations();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session && orgs && !orgsLoading) {
      if (orgs.length === 1) {
        // Auto-redirect if they only have one workspace
        router.push(`/${orgs[0].id}`);
      }
    }
  }, [session, orgs, orgsLoading, router]);

  const handleCreateWorkspace = async () => {
    setCreatingOrg(true);
    try {
      const { data, error } = await authClient.organization.create({
        name: `${session?.user.name || 'My'} Workspace`,
        slug: `workspace-${Date.now()}`
      });
      if (data) {
        router.push(`/${data.id}`);
      }
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth",
      });
      if (error) {
        setError(error.message || "Failed to sign in with Google");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/auth",
      });
      if (error) {
        setError(error.message || "Failed to sign in with GitHub");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) {
          setError(error.message || "Failed to sign in");
        } else {
          router.push("/auth");
          router.refresh();
        }
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (error) {
          setError(error.message || "Failed to sign up");
        } else {
          router.push("/auth");
          router.refresh();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col lg:flex-row font-[family-name:var(--font-geist-sans)] selection:bg-brand-mint text-brand-dark font-bold/30 relative">
      
      {/* Central Divider with "OR" Badge */}
      <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex-col items-center justify-center z-20 pointer-events-none">
        <div className="w-[1px] h-full bg-[#27272a]/50"></div>
        <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-base border border-[#27272a] flex items-center justify-center text-[10px] font-bold text-[#71717a] tracking-[0.2em]">
          OR
        </div>
      </div>

      {/* Left Pane: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-10">
        <div className="w-full max-w-[360px] mx-auto">

          {/* Logo & Header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-7 h-7 text-brand-mint flex items-center justify-center">
              <Box className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[14px] tracking-[0.2em] text-white/90">
              The Wharf
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mb-10 border-b border-[#27272a]/50">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`pb-4 text-[14px] font-medium transition-colors relative ${isLogin ? "text-white" : "text-[#71717a] hover:text-white/80"
                }`}
            >
              Sign In
              {isLogin && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-brand-mint text-brand-dark font-bold rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`pb-4 text-[14px] font-medium transition-colors relative ${!isLogin ? "text-white" : "text-[#71717a] hover:text-white/80"
                }`}
            >
              Sign Up
              {!isLogin && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-brand-mint text-brand-dark font-bold rounded-t-full" />
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] flex items-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#a1a1aa]">Name</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-base border border-[#27272a] rounded-lg text-white text-[14px] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[#52525b] disabled:opacity-50"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#a1a1aa]">Work email</label>
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 bg-surface-base border border-[#27272a] rounded-lg text-white text-[14px] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[#52525b] disabled:opacity-50"
                placeholder="name@company.com"
              />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-[#a1a1aa]">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 pr-10 bg-surface-base border border-[#27272a] rounded-lg text-white text-[14px] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[#52525b] disabled:opacity-50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isLogin && (
                <div className="flex justify-end mt-1">
                  <Link href="#" className="text-[12px] font-medium text-brand-mint hover:text-brand-mint transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full h-11 rounded-lg bg-brand-mint text-brand-dark font-bold text-[14px] font-medium hover:bg-blue-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isLogin ? "Sign In" : "Sign Up"
              )}
            </button>
          </form>

          <div className="relative flex items-center my-8">
            <div className="flex-grow border-t border-[#27272a]"></div>
            <span className="flex-shrink-0 mx-4 text-[#52525b] text-[12px] uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[#27272a]"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-transparent border border-[#27272a] text-white/90 text-[14px] font-medium hover:bg-white/[0.02] transition-colors disabled:opacity-50"
            >
              Continue with Google
            </button>
            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-transparent border border-[#27272a] text-white/90 text-[14px] font-medium hover:bg-white/[0.02] transition-colors disabled:opacity-50"
            >
              Continue with GitHub
            </button>
          </div>

          <div className="mt-12 text-left text-[11px] text-[#52525b]">
            By signing in you agree to our{" "}
            <Link href="/terms" className="hover:text-white transition-colors underline underline-offset-2">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="hover:text-white transition-colors underline underline-offset-2">Privacy Policy</Link>.
          </div>
        </div>
      </div>

      {/* Right Pane: Workspace Selection */}
      <div className="w-full lg:w-1/2 bg-[#0F1219] flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-10">
        
        <div className="w-full max-w-[420px] mx-auto">
          <h2 className="text-[24px] font-bold text-white tracking-tight mb-2">
            Choose a workspace
          </h2>
          <p className="text-[14px] text-[#a1a1aa] mb-8">
            You're a member of multiple organizations.
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {orgsLoading || sessionLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#71717a]" /></div>
            ) : orgs?.map((org: any) => (
              <Link key={org.id} href={`/${org.id}`} className="flex items-center justify-between p-4 rounded-xl bg-transparent border border-[#27272a] hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-elevated border border-[#27272a] flex items-center justify-center text-white text-[14px] font-bold shrink-0">
                    {org.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-bold text-white/90">{org.name}</span>
                      <span className="px-2 py-0.5 rounded text-brand-mint text-[9px] font-bold bg-brand-mint/10">
                        {org.role || 'Member'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[13px] font-medium text-white/70 group-hover:text-white transition-colors">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>

          <button 
            onClick={handleCreateWorkspace}
            disabled={creatingOrg || !session}
            className="flex items-center gap-1.5 text-[13px] font-bold text-brand-mint hover:text-brand-mint transition-colors mb-8 disabled:opacity-50"
          >
            {creatingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create new workspace
          </button>

          {(!orgs || orgs.length === 0) && !orgsLoading && (
            <div className="bg-[#101115] border border-dashed border-[#27272a] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
              <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
                No workspaces yet — create one to<br className="hidden sm:block" /> get started.
              </p>
              <button 
                onClick={handleCreateWorkspace}
                disabled={creatingOrg || !session}
                className="px-5 py-2.5 rounded-lg bg-brand-mint hover:bg-brand-mintHover transition-colors text-brand-dark font-bold text-[13px] whitespace-nowrap shrink-0 shadow-sm disabled:opacity-50"
              >
                Create Workspace
              </button>
            </div>
          )}

          <button 
            onClick={handleSignOut}
            className="text-[13px] text-[#71717a] hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>

      </div>

    </div>
  );
}