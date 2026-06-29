import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { headers } from "next/headers";
import { Search } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { InviteForm } from "../../../../components/settings/invite-form";
import { PendingInvites } from "../../../../components/settings/pending-invites";
import { IntegrationsTab } from "../../../../components/settings/integrations-tab";
import { SettingsTabs } from "../../../../components/settings/settings-tabs";

export default async function SettingsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { workspaceId } = await params;
  const { tab = "members" } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth");
  }

  // Fetch the organization along with its members and pending invitations
  let organization = await prisma.organization.findFirst({
    where: {
      OR: [
        { slug: workspaceId },
        { id: workspaceId }
      ]
    },
    include: {
      members: {
        include: { user: true }
      },
      invitations: {
        where: { status: "pending" },
        orderBy: { expiresAt: 'desc' }
      },
      githubInstallation: {
        include: { repositories: true }
      }
    }
  });

  if (!organization) {
    if (workspaceId === "default") {
      // Auto-create a default workspace for the user's first time logging in
      organization = await prisma.organization.create({
        data: {
          name: "Default Workspace",
          slug: "default",
          createdAt: new Date(),
          members: {
            create: {
              userId: session.user.id,
              role: "owner",
              createdAt: new Date()
            }
          }
        },
        include: {
          members: { include: { user: true } },
          invitations: { where: { status: "pending" }, orderBy: { expiresAt: 'desc' } },
          githubInstallation: { include: { repositories: true } }
        }
      });
    } else {
      notFound();
    }
  }

  // Ensure current user is a member (Authorization)
  const isMember = organization.members.some((m: any) => m.userId === session.user.id);
  if (!isMember) {
    redirect("/select-org");
  }

  // Format members for UI
  const members = organization.members.map((m: any) => ({
    id: m.id,
    name: m.user.name || "Unknown",
    email: m.user.email,
    role: m.role,
    isYou: m.userId === session.user.id,
    initials: (m.user.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2),
    color: m.userId === session.user.id ? "bg-brand-mint text-brand-dark font-bold" : "bg-[#27272a]"
  }));

  // Format pending invitations for UI
  const pendingInvites = organization.invitations.map((i: any) => ({
    id: i.id,
    email: i.email,
    role: i.role || "member",
    expiresAt: i.expiresAt
  }));

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
      {/* Header & Breadcrumb */}
      <div className="mb-8">
        <div className="text-sm text-[#71717a] mb-2">
          {organization.name} &gt; Settings
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-6">Workspace Settings</h1>
        
        {/* Tabs */}
        <SettingsTabs workspaceId={workspaceId} />
      </div>

      {tab === "members" ? (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column: Members List */}
          <div className="flex-1 bg-surface-card border border-[#27272a]/50 rounded-2xl p-6 h-fit">
            <div className="mb-6">
              <h2 className="text-[16px] font-semibold text-white/90 mb-4">Members ({members.length})</h2>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  className="w-full bg-surface-base border border-[#27272a]/50 rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="w-full">
              <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 px-4 pb-3 border-b border-[#27272a]/50 text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
                <div>Avatar + Name</div>
                <div>Email</div>
                <div>Role</div>
              </div>
              
              <div className="flex flex-col mt-2">
                {members.map((member: any) => (
                  <div key={member.id} className="grid grid-cols-[2fr_2fr_1fr] gap-4 px-4 py-3 items-center hover:bg-white/[0.02] rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0 ${member.color}`}>
                        {member.initials}
                      </div>
                      <span className="text-[14px] font-medium text-white/90 truncate">
                        {member.name} {member.isYou && <span className="text-[#71717a] font-normal ml-1">(you)</span>}
                      </span>
                    </div>
                    <div className="text-[14px] text-[#a1a1aa] truncate">
                      {member.email}
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${
                        member.role === 'admin' || member.role === 'owner' ? 'bg-brand-mint/10 text-brand-mint' : 'bg-white/[0.03] text-[#a1a1aa]'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Invite & Pending */}
          <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-6">
            <InviteForm workspaceId={organization.id} workspaceName={organization.name} />
            <PendingInvites invites={pendingInvites} />
          </div>
        </div>
      ) : tab === "integrations" ? (
        <IntegrationsTab installation={organization.githubInstallation as any} workspaceId={workspaceId} />
      ) : null}
    </div>
  );
}
