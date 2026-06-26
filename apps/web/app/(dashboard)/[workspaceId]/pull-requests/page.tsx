"use client";

import { ChevronDown, Zap, CheckCircle2, RefreshCw, Check } from "lucide-react";
import React from "react";

export default function PRReviewPage() {
  return (
    <div className="flex flex-col h-full bg-[#0A0D14] overflow-hidden">
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#27272a]/50 shrink-0">
        <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
          <span className="hover:text-white cursor-pointer transition-colors">Feature Requests</span>
          <span className="text-[10px]">&gt;</span>
          <span className="hover:text-white cursor-pointer transition-colors">Support SSO login for enterprise plans</span>
          <span className="text-[10px]">&gt;</span>
          <span className="text-[#a1a1aa]">PR #141</span>
        </div>
        <h1 className="text-[24px] font-bold text-white tracking-tight leading-tight mb-4">
          PR #141 — feat: SSO login for enterprise plans
        </h1>
        
        <div className="flex items-center gap-4 text-[13px]">
          <span className="text-[#a1a1aa]">acmecorp/auth-service</span>
          <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 font-semibold text-[11px]">
            Open
          </span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
              PN
            </div>
            <span className="text-white/90 font-medium">Priya Nair</span>
            <span className="text-[#71717a]">opened 1d ago</span>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <span className="text-red-400 font-bold">3 Blocking</span>
            <span className="text-amber-400 font-bold">2 Non-blocking</span>
            <span className="text-emerald-400 font-bold">1 Resolved</span>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Code Diff */}
        <div className="flex-1 border-r border-[#27272a]/50 flex flex-col bg-[#0A0D14] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#13161F] border-b border-[#27272a]/50 shrink-0">
            <div className="flex items-center gap-2 text-[#a1a1aa] text-[13px] font-mono">
              <ChevronDown className="w-4 h-4" />
              src/auth/sso_handler.ts
            </div>
            <div className="text-[12px] font-mono">
              <span className="text-emerald-400">+84</span> <span className="text-red-400">-12</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-[#0A0D14] font-mono text-[13px] leading-[1.6]">
            
            <DiffRow numL={1} numR={1} text="import { Request, Response } from 'express';" />
            <DiffRow numL={2} numR={2} text="import { OAuthClient } from '../lib/oauth';" />
            <DiffRow numL={3} numR={3} text="import { SessionStore } from '../lib/session';" />
            <DiffRow empty />
            <DiffRow numL={5} numR={5} text="export class SSOHandler {" />
            <DiffRow numL={6} numR={6} text="  private oauthClient: OAuthClient;" />
            <DiffRow numL={7} numR={7} text="  private session: SessionStore;" />
            <DiffRow empty />
            <DiffRow numL={9} numR={9} text="+ async handleCallback(req: Request, res: Response): Promise<void> {" type="add" />
            <DiffRow numL={10} numR={10} text="+   const { code, state } = req.query;" type="add" />
            <DiffRow numL={11} numR={11} text="+   const cb = req.query.callbackUrl as string;" type="add" annotation="blocking" />
            <DiffRow numL={12} numR={12} text="+   const token = await this.oauthClient.exchange(code as string);" type="add" />
            <DiffRow empty type="add" />
            <DiffRow numL={14} numR={14} text="+   await this.session.create(req, { userId: token.sub });" type="add" annotation="non-blocking" />
            <DiffRow numL={15} numR={15} text="+   res.redirect(cb || '/dashboard');" type="add" />
            <DiffRow numL={16} numR={16} text="  }" />
            <DiffRow empty />
            <DiffRow numL={18} numR={18} text="- async initiateLogin(req: Request, res: Response): Promise<void> {" type="remove" />
            <DiffRow numL={19} numR={19} text="+ async initiateLogin(req: Request, res: Response): Promise<void> {" type="add" />
            <DiffRow numL={20} numR={20} text="+   const authUrl = this.oauthClient.getAuthUrl();" type="add" />
            <DiffRow numL={21} numR={21} text="+   res.redirect(authUrl);" type="add" annotation="resolved" />
            <DiffRow numL={22} numR={22} text="  }" />
            <DiffRow empty />
            <DiffRow numL={24} numR={24} text="+ async validateToken(token: string): Promise<boolean> {" type="add" />
            <DiffRow numL={25} numR={25} text="+   return this.oauthClient.verify(token);" type="add" />
            <DiffRow numL={26} numR={26} text="  }" />
            <DiffRow numL={27} numR={27} text="}" />
            <DiffRow empty />
            <DiffRow numL={29} numR={29} text="+ export const ssoRouter = Router();" type="add" />
            <DiffRow numL={30} numR={30} text="+ const handler = new SSOHandler();" type="add" />
            <DiffRow numL={31} numR={31} text="+ ssoRouter.get('/auth/sso/login', handler.initiateLogin);" type="add" />
            <DiffRow numL={32} numR={32} text="+ ssoRouter.get('/auth/sso/callback', handler.handleCallback);" type="add" />

          </div>
        </div>

        {/* Right Column: AI Review Comments */}
        <div className="w-[480px] flex-shrink-0 flex flex-col bg-[#13161F] relative">
          
          <div className="px-6 py-4 border-b border-[#27272a]/50 flex items-center justify-between shrink-0 bg-[#13161F] z-10">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
              <h2 className="text-[15px] font-bold text-white">AI Review Comments</h2>
              <span className="px-1.5 py-0.5 bg-white/[0.05] text-[#a1a1aa] rounded text-[11px] font-bold">6</span>
            </div>
            <span className="text-[12px] text-[#71717a]">Pass 2 of 3</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
            
            <CommentCard 
              severity="BLOCKING" 
              category="SECURITY"
              text="Missing CSRF token validation on SSO callback endpoint — this allows cross-site request forgery attacks on the authentication flow."
              line="Line 10 · src/auth/sso_handler.ts"
            />
            
            <CommentCard 
              severity="BLOCKING" 
              category="PERFORMANCE"
              categoryColor="text-amber-500"
              text="No rate limiting on /auth/sso/callback — brute-force risk. Recommend adding express-rate-limit middleware with a 10 req/min cap per IP."
              line="Line 9 · src/auth/sso_handler.ts"
            />

            <CommentCard 
              severity="BLOCKING" 
              category="EDGE CASE"
              categoryColor="text-amber-500"
              text="Token expiry not checked before session creation. If token.exp is in the past, a stale session will be created silently without error."
              line="Line 14 · src/auth/sso_handler.ts"
            />

            <CommentCard 
              severity="NON-BLOCKING" 
              category="CODE QUALITY"
              categoryColor="text-[#71717a]"
              categoryBg="bg-white/[0.03]"
              text="Variable name cb is ambiguous — rename to callbackUrl for clarity and consistency with the rest of the codebase."
              line="Line 11 · src/auth/sso_handler.ts"
            />

            <CommentCard 
              severity="NON-BLOCKING" 
              category="PRD MISMATCH"
              categoryColor="text-blue-500"
              categoryBg="bg-blue-500/10"
              text="PRD requires SSO to support SAML 2.0 but implementation only handles OAuth 2.0. SAML provider integration is missing entirely."
              line="Line 6 · src/auth/sso_handler.ts"
            />

            <CommentCard 
              severity="RESOLVED" 
              category="CODE QUALITY"
              categoryColor="text-[#71717a]"
              categoryBg="bg-white/[0.03]"
              text={<span>Missing return type annotation on <code className="bg-[#27272a] px-1 py-0.5 rounded text-[11px]">initiateLogin</code> — add <code className="bg-[#27272a] px-1 py-0.5 rounded text-[11px]">Promise&lt;void&gt;</code> for explicit typing.</span>}
              line="Line 19 · src/auth/sso_handler.ts"
              resolved
            />

          </div>

          {/* Sticky Action Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#13161F] border-t border-[#27272a]/50">
            <div className="flex items-center gap-4 mb-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#27272a]/50 text-[#71717a] rounded-lg text-[14px] font-bold cursor-not-allowed">
                <CheckCircle2 className="w-4 h-4" />
                Request Human Approval
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-white/[0.03] border border-[#27272a] transition-colors text-white rounded-lg text-[14px] font-bold shrink-0">
                <RefreshCw className="w-4 h-4" />
                Re-run AI Review
              </button>
            </div>
            <p className="text-[12px] text-[#71717a]">Resolve all blocking issues first</p>
          </div>

        </div>
      </div>
    </div>
  );
}

// Reusable Diff Row Component
function DiffRow({ 
  numL, 
  numR, 
  text, 
  type = "none",
  empty = false,
  annotation = null
}: { 
  numL?: number, 
  numR?: number, 
  text?: string, 
  type?: "none" | "add" | "remove",
  empty?: boolean,
  annotation?: "blocking" | "non-blocking" | "resolved" | null
}) {
  let bgClass = "bg-transparent";
  let textClass = "text-[#a1a1aa]";
  
  if (type === "add") {
    bgClass = "bg-emerald-500/[0.15]";
    textClass = "text-emerald-400";
  } else if (type === "remove") {
    bgClass = "bg-red-500/[0.15]";
    textClass = "text-red-400";
  }

  let annotDot = null;
  if (annotation === "blocking") annotDot = <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-red-500 uppercase">Blocking</span></div>;
  if (annotation === "non-blocking") annotDot = <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] font-bold text-amber-500 uppercase">Non-blocking</span></div>;
  if (annotation === "resolved") annotDot = <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-emerald-500 uppercase">Resolved</span></div>;

  return (
    <div className={`flex w-full ${bgClass} hover:bg-white/[0.02] transition-colors relative group`}>
      <div className="w-12 shrink-0 border-r border-[#27272a]/30 text-right pr-2 text-[#52525b] select-none py-0.5">
        {empty ? "" : numL || "\u00A0"}
      </div>
      <div className="w-12 shrink-0 border-r border-[#27272a]/30 text-right pr-2 text-[#52525b] select-none py-0.5">
        {empty ? "" : numR || "\u00A0"}
      </div>
      <div className={`flex-1 pl-4 py-0.5 whitespace-pre ${textClass}`}>
        {empty ? "" : text}
      </div>
      {annotDot}
    </div>
  );
}

// Reusable Comment Card Component
function CommentCard({
  severity,
  category,
  categoryColor = "text-red-500",
  categoryBg = "bg-transparent",
  text,
  line,
  resolved = false
}: {
  severity: "BLOCKING" | "NON-BLOCKING" | "RESOLVED";
  category: string;
  categoryColor?: string;
  categoryBg?: string;
  text: React.ReactNode;
  line: string;
  resolved?: boolean;
}) {
  
  let severityColor = "text-red-500";
  if (severity === "NON-BLOCKING") severityColor = "text-amber-500";
  if (severity === "RESOLVED") severityColor = "text-emerald-500";

  return (
    <div className={`bg-[#0A0D14] rounded-xl p-5 border ${resolved ? 'border-[#27272a]/30 opacity-70' : 'border-[#27272a]/50'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-bold tracking-widest ${severityColor}`}>
          {severity}
        </span>
        <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${categoryColor} ${categoryBg}`}>
          {category}
        </span>
      </div>
      
      <p className="text-[13px] text-white/90 leading-relaxed mb-4">
        {text}
      </p>
      
      <div className="text-[11px] text-[#71717a] font-mono">
        {line}
      </div>

      {resolved && (
        <div className="mt-4 pt-3 border-t border-[#27272a]/50 flex items-center gap-1.5 text-emerald-500 text-[12px] font-medium">
          <Check className="w-3.5 h-3.5" />
          Resolved in Pass 2
        </div>
      )}
    </div>
  );
}
