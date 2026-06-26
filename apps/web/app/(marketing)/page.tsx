import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, GitPullRequest, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
    title: "ShipFlow AI — Feature requests to shipped code, automated",
    description:
        "ShipFlow AI turns feature requests into production-ready pull requests through an AI pipeline: clarification, PRD generation, task breakdown, code generation, AI review, and human approval.",
};

const PIPELINE_STAGES = [
    { label: "Request", caption: "Feature submitted" },
    { label: "PRD", caption: "AI-generated spec" },
    { label: "Tasks", caption: "Broken into work items" },
    { label: "Code", caption: "PR opened on GitHub" },
    { label: "AI Review", caption: "Checked against PRD" },
    { label: "Fixes", caption: "Issues auto-resolved" },
    { label: "Approval", caption: "Human sign-off" },
    { label: "Shipped", caption: "Merged to production" },
] as const;

const FEATURES = [
    {
        icon: FileText,
        heading: "AI-generated PRDs",
        description:
            "Paste a raw feature request. ShipFlow asks clarifying questions, then produces a structured PRD with acceptance criteria — ready for engineering review in minutes, not days.",
    },
    {
        icon: GitPullRequest,
        heading: "Full traceability, request to code",
        description:
            "Every pull request links back to its originating PRD and task. When requirements change, you see exactly which code is affected and why.",
    },
    {
        icon: ShieldAlert,
        heading: "Severity-tagged AI code review",
        description:
            "The AI reviewer checks each PR against the PRD and flags issues by severity — critical blockers, warnings, and suggestions — so your team focuses on what matters.",
    },
] as const;

export default function MarketingPage() {
    return (
        <div className="min-h-screen bg-[#0A0D14] text-slate-300 font-[family-name:var(--font-geist-sans)]">
            {/* ── Header ── */}
            <header className="relative z-10">
                <div className="mx-auto flex items-center justify-between px-6 py-5">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14] rounded-md"
                    >
                        <span className="flemax h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white font-[family-name:var(--font-geist-mono)]">
                            SF
                        </span>
                        <span className="text-lg font-semibold text-white tracking-tight">
                            ShipFlow AI
                        </span>
                    </Link>

                    {/* Nav */}
                    <nav className="hidden items-center gap-8 md:flex">
                        {["Product", "Pricing", "Docs"].map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className="text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14] rounded-md"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/sign-in"
                            className="hidden text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14] rounded-md sm:block"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/sign-up"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14]"
                        >
                            Start pilot
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {/* ── Hero ── */}
                <section className="mx-auto px-6 pt-24 pb-28 text-center align-center sm:pt-32 sm:pb-32">
                    <p className="mb-4 text-xs uppercase tracking-widest text-blue-400 font-[family-name:var(--font-geist-mono)]">
                        From request to production
                    </p>
                    <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Turn feature requests into shipped pull requests with an AI pipeline
                    </h1>
                    <p className="text-pretty text-center mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                        ShipFlow takes a raw feature request, generates a PRD, breaks it into
                        tasks, writes the code, reviews it against the spec, and hands your
                        team a ready-to-merge PR.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/sign-up"
                            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14]"
                        >
                            Start a free pilot
                        </Link>
                        <Link
                            href="/docs"
                            className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14] rounded-md"
                        >
                            Read the docs
                            <ArrowRight className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>

                {/* ── Pipeline Visualization ── */}
                <section className="mx-auto max-w-6xl px-6 pb-28">
                    <div className="overflow-x-auto rounded-md border border-slate-800/60 bg-[#0A0D14] px-6 py-10 sm:px-10">
                        <div className="flex min-w-max items-center gap-0">
                            {PIPELINE_STAGES.map((stage, i) => {
                                const isShipped = stage.label === "Shipped";
                                return (
                                    <div key={stage.label} className="flex items-center">
                                        {/* Stage */}
                                        <div className="flex flex-col items-center text-center" style={{ minWidth: "100px" }}>
                                            <span
                                                className={`font-[family-name:var(--font-geist-mono)] text-sm font-medium ${isShipped ? "text-emerald-400" : "text-blue-400"
                                                    }`}
                                            >
                                                {stage.label}
                                            </span>
                                            <span className="mt-1.5 text-xs text-slate-500 max-w-[100px]">
                                                {stage.caption}
                                            </span>
                                        </div>

                                        {/* Connector */}
                                        {i < PIPELINE_STAGES.length - 1 && (
                                            <div className="flex items-center">
                                                <div className="h-px w-8 bg-slate-700 sm:w-12" />
                                                <ArrowRight className="h-3 w-3 shrink-0 text-slate-600" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section className="mx-auto max-w-6xl px-6 pb-24">
                    <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                        {FEATURES.map((feature) => (
                            <div key={feature.heading}>
                                <feature.icon className="mb-4 h-5 w-5 text-blue-400" strokeWidth={1.5} />
                                <h3 className="text-base font-semibold text-white">
                                    {feature.heading}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="border-t border-slate-800/60">
                    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Ship your first AI-driven PR this week
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
                            Connect your GitHub repo, submit a feature request, and watch
                            ShipFlow produce a reviewed pull request — start to finish.
                        </p>
                        <Link
                            href="/sign-up"
                            className="mt-8 inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14]"
                        >
                            Start your pilot
                        </Link>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-slate-800/60">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-slate-500 sm:flex-row">
                    <span>&copy; {new Date().getFullYear()} ShipFlow AI. All rights reserved.</span>
                    <nav className="flex gap-6">
                        {[
                            { label: "Privacy", href: "/privacy" },
                            { label: "Terms", href: "/terms" },
                            { label: "Status", href: "/status" },
                        ].map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14] rounded-md"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </footer>
        </div>
    );
}
