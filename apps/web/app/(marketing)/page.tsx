import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, GitPullRequest, ShieldAlert, Cpu, Settings, LineChart, CheckCircle2, Layout, GitMerge, MessageSquare, Code2, Database, Webhook } from "lucide-react";

export const metadata: Metadata = {
    title: "The Wharf — Feature requests to shipped code, automated",
    description:
        "The Wharf turns feature requests into production-ready pull requests through an AI pipeline.",
};

export default function MarketingPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0f172a] font-[family-name:var(--font-geist-sans)] selection:bg-brand-mint selection:text-brand-dark">
            {/* ── Header ── */}
            <header className="relative z-10 border-b border-slate-200/50 bg-[#F8FAFC]/80 backdrop-blur-md sticky top-0">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-sm font-bold text-brand-mint font-[family-name:var(--font-geist-mono)]">
                            SF
                        </span>
                        <span className="text-xl font-bold tracking-tight text-brand-dark">
                            The Wharf
                        </span>
                    </Link>

                    {/* Nav */}
                    <nav className="hidden items-center gap-8 md:flex">
                        {["Home", "Product", "Pricing", "Docs"].map((item) => (
                            <Link
                                key={item}
                                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                                className="text-[15px] font-medium text-slate-600 transition-colors hover:text-brand-dark"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/auth"
                            className="hidden text-[15px] font-medium text-slate-600 transition-colors hover:text-brand-dark sm:block"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth"
                            className="rounded-full bg-brand-dark px-6 py-2.5 text-[15px] font-semibold text-white transition-transform hover:scale-105 active:scale-95"
                        >
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {/* ── Hero ── */}
                <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-24">
                    <div className="relative inline-block mb-12">
                        <h1 className="text-balance text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0f172a] sm:text-6xl lg:text-[72px]">
                            Ship features <span className="text-brand-dark relative">
                                5x faster.
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-mint" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>
                        <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 font-medium leading-relaxed">
                            From user request to reviewed pull request, automated. Zero human intervention required until final approval.
                        </p>
                        
                        <div className="mt-10 flex items-center justify-center gap-4">
                            <Link href="/auth" className="rounded-full bg-brand-dark px-8 py-3.5 text-[15px] font-bold text-white transition-all hover:shadow-lg hover:shadow-brand-dark/20 hover:-translate-y-0.5">
                                Start Free Trial
                            </Link>
                            <Link href="/docs" className="rounded-full bg-white border border-slate-200 px-8 py-3.5 text-[15px] font-bold text-slate-700 transition-all hover:bg-slate-50">
                                View Demo
                            </Link>
                        </div>
                    </div>

                    {/* Hero Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16 auto-rows-[240px]">
                        {/* Image Card */}
                        <div className="col-span-1 md:col-span-1 rounded-3xl overflow-hidden relative shadow-sm border border-slate-200/50">
                            <Image src="/hero_code_blocks.png" alt="Code Blocks" fill className="object-cover" />
                        </div>
                        {/* Stat Card Dark */}
                        <div className="col-span-1 md:col-span-1 rounded-3xl bg-brand-dark p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group text-left">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 relative z-10">
                                <GitMerge className="w-5 h-5 text-brand-mint" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-4xl font-black text-white mb-1">100+</div>
                                <div className="text-sm font-medium text-white/70">PRs Merged<br/>Automated</div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-brand-mint opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 z-0"></div>
                        </div>
                        {/* Stat Card Light/Mint */}
                        <div className="col-span-1 md:col-span-1 rounded-3xl bg-brand-mint p-8 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-3 bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-brand-dark">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Stats
                            </div>
                            <div className="text-5xl font-black text-brand-dark mb-2 tracking-tighter">5x</div>
                            <div className="text-sm font-bold text-brand-dark/70 uppercase tracking-widest">Faster Delivery</div>
                        </div>
                        {/* Extra Dark Card */}
                        <div className="col-span-1 md:col-span-1 rounded-3xl bg-[#1e293b] p-8 flex flex-col justify-between shadow-sm relative overflow-hidden text-left">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Zero Trust AI</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Every line of code is statically analyzed and reviewed against PRD criteria.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Social Proof ── */}
                <section className="border-t border-slate-200/50 bg-[#F8FAFC] py-16">
                    <div className="mx-auto max-w-7xl px-6 text-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10">Trusted by engineering teams at</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Cpu className="w-7 h-7"/> TechCorp</div>
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Database className="w-7 h-7"/> DataFlow</div>
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Layout className="w-7 h-7"/> BuildKite</div>
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Webhook className="w-7 h-7"/> SyncOps</div>
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><LineChart className="w-7 h-7"/> ScaleAI</div>
                        </div>
                    </div>
                </section>

                {/* ── Features Grid (Dark Teal) ── */}
                <section className="bg-brand-dark py-24 sm:py-32 rounded-t-[3rem]">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Efficient and Integrated Development Services
                            </h2>
                            <p className="mt-4 text-slate-400 text-lg">
                                The Wharf handles the entire lifecycle of a feature request, so your engineers can focus on architecture and strategy.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: FileText, title: "Automated PRDs", desc: "Transforms vague requests into crisp, structured product requirements." },
                                { icon: Cpu, title: "Task Generation", desc: "Breaks down PRDs into granular, actionable engineering tasks." },
                                { icon: Layout, title: "Automated Planning", desc: "Populates a Kanban board with structured engineering tasks." },
                                { icon: ShieldAlert, title: "AI Review", desc: "Automatically reviews code against acceptance criteria." },
                                { icon: Settings, title: "Auto-Fixes", desc: "Detects bugs and pushes commits to resolve issues immediately." },
                                { icon: CheckCircle2, title: "Human Approval", desc: "Simple 1-click approvals for team leads before shipping." },
                            ].map((feature, i) => (
                                <div key={i} className="rounded-3xl bg-[#133633] border border-white/5 p-8 hover:bg-white/5 transition-colors group cursor-default">
                                    <feature.icon className="h-6 w-6 text-brand-mint mb-6" />
                                    <h3 className="text-lg font-bold text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Key Benefits (Split View) ── */}
                <section className="py-24 sm:py-32 bg-[#F8FAFC]">
                    <div className="mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 aspect-square lg:aspect-auto lg:h-[500px] mb-12 lg:mb-0 bg-white">
                            <Image src="/ui_snippet.png" alt="Dashboard UI" fill className="object-cover" />
                        </div>
                        
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl mb-8">
                                Key Benefits of Our System for Your Business Efficiency
                            </h2>
                            <p className="text-slate-600 text-lg mb-8">
                                Our platform seamlessly integrates into your existing workflow, ensuring high quality and rapid delivery.
                            </p>
                            
                            <ul className="space-y-6">
                                {[
                                    { title: "Accelerated Time-to-Market", desc: "Cut development time by 80% with automated code generation." },
                                    { title: "Optimized Developer Workload", desc: "Free your senior engineers to focus on architecture, not boilerplate." },
                                    { title: "Shift-Left QA Prevention", desc: "AI reviews catch requirement mismatches before they hit staging." },
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-brand-mint flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-dark" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-[#0f172a] mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ── Pricing (Dark) ── */}
                <section className="bg-[#0A0D14] py-24 sm:py-32 rounded-[3rem] mx-4 mb-4">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Tailored Plans for Your Scale
                            </h2>
                            <p className="mt-4 text-slate-400 text-lg">
                                Simple, transparent pricing that grows with your engineering team.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-6">
                            {/* Pro Plan */}
                            <div className="rounded-3xl bg-[#1A1E29] border border-slate-800 p-8 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2">Startup</h3>
                                <p className="text-sm text-slate-400 mb-6">For small teams building fast.</p>
                                <div className="mb-6 flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white">$39</span>
                                    <span className="text-sm text-slate-500 font-medium">/ month</span>
                                </div>
                                <Link href="/auth" className="rounded-full border border-slate-700 py-3 text-center text-sm font-bold text-white hover:bg-slate-800 transition-colors mb-8">
                                    Start Free Trial
                                </Link>
                                <ul className="space-y-4 text-sm text-slate-300 font-medium flex-1">
                                    <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-brand-mint" /> 10 AI Reviews per month</li>
                                    <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-brand-mint" /> Standard AI Review</li>
                                    <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-brand-mint" /> Unlimited Users</li>
                                </ul>
                            </div>
                            
                            {/* Team Plan */}
                            <div className="rounded-3xl bg-[#1A1E29] border border-brand-mint/20 p-8 flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-brand-mint text-brand-dark text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">Popular</div>
                                <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
                                <p className="text-sm text-slate-400 mb-6">For scaling engineering teams.</p>
                                <div className="mb-6 flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white">$99</span>
                                    <span className="text-sm text-slate-500 font-medium">/ month</span>
                                </div>
                                <Link href="/auth" className="rounded-full bg-brand-mint py-3 text-center text-sm font-bold text-brand-dark hover:bg-[#b5eb9f] transition-colors mb-8">
                                    Start Free Trial
                                </Link>
                                <ul className="space-y-4 text-sm text-slate-300 font-medium flex-1">
                                    <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-brand-mint" /> 100 AI Reviews per month</li>
                                    <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-brand-mint" /> Advanced AI Review</li>
                                    <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-brand-mint" /> Priority Support</li>
                                </ul>
                            </div>
                        </div>
                        
                        {/* Enterprise Wide Card */}
                        <div className="max-w-4xl mx-auto rounded-3xl bg-brand-dark p-8 md:p-10 flex flex-col md:flex-row items-center justify-between border border-[#133633]">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                                <p className="text-sm text-brand-mint/80 font-medium">Custom limits, VPC deployment, and dedicated success manager.</p>
                            </div>
                            <Link href="/auth" className="mt-6 md:mt-0 rounded-full bg-white px-8 py-3 text-sm font-bold text-brand-dark hover:bg-slate-100 transition-colors shrink-0">
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Integrations ── */}
                <section className="py-24 sm:py-32 bg-[#F8FAFC] overflow-hidden">
                    <div className="mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                        <div className="mb-12 lg:mb-0">
                            <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl mb-6">
                                Empowering Top Teams with Seamless Integrations
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                Connect The Wharf to your existing stack in seconds. Deeply integrated with GitHub to keep your workflows exactly how you like them.
                            </p>
                            <Link href="/docs" className="inline-flex items-center gap-2 rounded-full bg-brand-mint px-6 py-2.5 text-sm font-bold text-brand-dark hover:bg-[#b5eb9f] transition-colors">
                                View all integrations
                            </Link>
                        </div>
                        
                        <div className="relative rounded-[3rem] bg-brand-mint/50 p-12 aspect-square flex items-center justify-center overflow-hidden border border-brand-mint">
                            {/* Orbit Graphic Concept */}
                            <div className="absolute w-[120%] h-[120%] md:w-[80%] md:h-[80%] rounded-full border border-dashed border-brand-dark/10 animate-[spin_60s_linear_infinite]"></div>
                            <div className="absolute w-[80%] h-[80%] md:w-[50%] md:h-[50%] rounded-full border border-dashed border-brand-dark/20 animate-[spin_40s_linear_infinite_reverse]"></div>
                            
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center z-10">
                                <span className="text-2xl font-black text-brand-dark font-[family-name:var(--font-geist-mono)]">SF</span>
                            </div>
                            
                            {/* Orbiting Icons */}
                            <div className="absolute top-[20%] left-[20%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-brand-dark">
                                <Code2 className="w-6 h-6" />
                            </div>
                            <div className="absolute bottom-[20%] right-[20%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-500">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div className="absolute top-[30%] right-[15%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-indigo-500">
                                <Webhook className="w-6 h-6" />
                            </div>
                            <div className="absolute bottom-[25%] left-[15%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-emerald-500">
                                <Database className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="bg-brand-dark py-24 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-50"></div>
                        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    </div>
                    <div className="relative z-10 mx-auto max-w-3xl px-6">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-8">
                            From Idea to Production in Days
                        </h2>
                        <p className="text-brand-mint/80 text-lg mb-10 font-medium">
                            Join the teams who are shipping features 5x faster with The Wharf.
                        </p>
                        <Link href="/auth" className="rounded-full bg-brand-mint px-10 py-4 text-[15px] font-bold text-brand-dark transition-transform hover:scale-105 inline-block shadow-lg shadow-brand-mint/20">
                            Start Free Trial
                        </Link>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="bg-[#0A0D14] py-16">
                <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-6">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-dark text-[10px] font-bold text-brand-mint font-[family-name:var(--font-geist-mono)]">
                                SF
                            </span>
                            <span className="text-lg font-bold text-white">
                                The Wharf
                            </span>
                        </Link>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                            Decelerate to accelerate. Ship software with an automated AI pipeline that just works.
                        </p>
                        <p className="text-xs text-slate-600">
                            &copy; {new Date().getFullYear()} The Wharf. All rights reserved.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Connect</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Twitter</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">GitHub</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">LinkedIn</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
