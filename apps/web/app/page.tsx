import Link from "next/link";
import { ArrowRight, Bot, Code2, GitMerge, ShieldCheck, Zap } from "lucide-react";

export const metadata = {
  title: "ShipFlow AI | The AI co-pilot that turns raw requests into shipped code",
  description: "Automate spec clarification, PRD generation, and strict PR validation with ShipFlow AI.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-purple-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ShipFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link 
              href="/auth" 
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              Now tracking background Inngest jobs
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              From raw idea to <br className="hidden md:block" /> shipped PR, automatically.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The AI co-pilot that interviews stakeholders to eliminate ambiguity, generates structured PRDs, and strictly validates every pull request against the specs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth" 
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black text-base font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                Start building for free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 px-6 bg-[#0F0F11]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship faster.</h2>
              <p className="text-gray-400">Stop wasting time clarifying specs and manually reviewing logic.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="md:col-span-2 bg-[#161618] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                <Bot className="w-10 h-10 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Automated Spec Clarification</h3>
                <p className="text-gray-400 max-w-md">
                  Our interactive AI agent acts as a product manager, interviewing the requester to lock down missing dimensions and edge cases before engineering even looks at it.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#161618] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                <Code2 className="w-10 h-10 text-purple-400 mb-6" />
                <h3 className="text-2xl font-bold mb-3">PRD & Task Generation</h3>
                <p className="text-gray-400">
                  Instantly convert locked-in specs into structured PRDs and granular engineering tasks synced with your workflow.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#161618] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors" />
                <GitMerge className="w-10 h-10 text-green-400 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Strict PR Validation</h3>
                <p className="text-gray-400">
                  Every pull request is automatically reviewed against the generated PRD. If it doesn't meet the Acceptance Criteria, it doesn't ship.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="md:col-span-2 bg-[#161618] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors" />
                <ShieldCheck className="w-10 h-10 text-amber-400 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Tenant Isolation & Enterprise Security</h3>
                <p className="text-gray-400 max-w-md">
                  Built with strict multi-tenancy. Every request, task, and review is cryptographically scoped to your organization. Complete data privacy for your source code.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F11] to-[#0A0A0A]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to ship better software?</h2>
            <p className="text-xl text-gray-400 mb-10">
              Join the engineering teams using ShipFlow to eliminate ambiguity and automate code reviews.
            </p>
            <Link 
              href="/auth" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-black text-base font-semibold hover:bg-gray-100 transition-colors"
            >
              Create your workspace
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 px-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ShipFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
