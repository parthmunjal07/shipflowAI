"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Box } from "lucide-react";
import { authClient } from "../../lib/auth-client";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/projects",
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
        callbackURL: "/projects",
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
          router.push("/projects");
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
          router.push("/projects");
          router.refresh();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex font-[family-name:var(--font-geist-sans)] selection:bg-blue-500/30">

      {/* Left Pane: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-10">
        <div className="w-full max-w-[360px] mx-auto">

          {/* Logo & Header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Box className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[15px] tracking-[0.15em] text-white/90">
              SHIPFLOW AI
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
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`pb-4 text-[14px] font-medium transition-colors relative ${!isLogin ? "text-white" : "text-[#71717a] hover:text-white/80"
                }`}
            >
              Sign Up
              {!isLogin && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-500 rounded-t-full" />
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
                  className="w-full h-11 px-3 bg-[#0A0D14] border border-[#27272a] rounded-lg text-white text-[14px] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[#52525b] disabled:opacity-50"
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
                className="w-full h-11 px-3 bg-[#0A0D14] border border-[#27272a] rounded-lg text-white text-[14px] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[#52525b] disabled:opacity-50"
                placeholder="name@company.com"
              />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-[#a1a1aa]">Password</label>
                {isLogin && (
                  <Link href="#" className="text-[12px] font-medium text-blue-500 hover:text-blue-400 transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 pr-10 bg-[#0A0D14] border border-[#27272a] rounded-lg text-white text-[14px] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[#52525b] disabled:opacity-50"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full h-11 rounded-lg bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]"
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
              className="w-full h-11 flex items-center justify-center gap-3 rounded-lg bg-[#0A0D14] border border-[#27272a] text-white/80 text-[14px] font-medium hover:bg-[#131417] hover:text-white transition-colors disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-lg bg-[#0A0D14] border border-[#27272a] text-white/80 text-[14px] font-medium hover:bg-[#131417] hover:text-white transition-colors disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="mt-12 text-center text-[12px] text-[#52525b]">
            By signing in you agree to our{" "}
            <Link href="/terms" className="hover:text-white transition-colors underline underline-offset-2">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="hover:text-white transition-colors underline underline-offset-2">Privacy Policy</Link>.
          </div>
        </div>
      </div>

      {/* Right Pane: Organization Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#101115] border-l border-white/[0.05] items-center justify-center p-12 lg:p-24 relative overflow-hidden select-none pointer-events-none">

        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full" />

        {/* Mockup Container */}
        <div className="w-full max-w-[440px] bg-[#0A0D14]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl relative z-10">
          <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">
            Welcome back
          </h2>
          <p className="text-[14px] text-[#a1a1aa] mb-8">
            Choose a workspace to continue
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {/* Workspace Card 1 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-[13px] font-semibold shadow-inner">
                  AC
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-white/90">Acme Corp</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20 uppercase tracking-wide">
                      Admin
                    </span>
                  </div>
                  <span className="text-[12px] text-[#71717a] mt-0.5">14 active projects</span>
                </div>
              </div>
            </div>

            {/* Workspace Card 2 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-[13px] font-semibold">
                  RS
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-white/90">Relay Systems</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[#a1a1aa] text-[10px] font-semibold border border-white/[0.1] uppercase tracking-wide">
                      Member
                    </span>
                  </div>
                  <span className="text-[12px] text-[#71717a] mt-0.5">3 active projects</span>
                </div>
              </div>
            </div>

            {/* Workspace Card 3 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors opacity-60">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-[13px] font-semibold">
                  NB
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-white/90">Northbridge</span>
                  </div>
                  <span className="text-[12px] text-[#71717a] mt-0.5">Viewer access</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
            <button className="text-[13px] font-medium text-blue-500">
              + New Workspace
            </button>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}