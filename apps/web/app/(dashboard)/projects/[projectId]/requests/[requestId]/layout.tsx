import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import Link from "next/link";
import { FeatureRequestTabs } from "../../../../../../components/feature-request-tabs";

export default async function FeatureRequestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string; requestId: string }>;
}) {
  const { requestId, projectId } = await params;

  const featureRequest = await prisma.featureRequest.findUnique({
    where: { id: requestId, projectId },
    select: { id: true, title: true, content: true, status: true }
  });

  if (!featureRequest) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
          &larr; Back to Project
        </Link>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${
            featureRequest.status === "SHIPPED" ? "bg-green-100 text-green-700" :
            featureRequest.status === ("READY_FOR_APPROVAL" as any) ? "bg-purple-100 text-purple-700" :
            featureRequest.status === "REJECTED" ? "bg-red-100 text-red-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {featureRequest.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{featureRequest.title}</h1>
        <p className="text-gray-600 whitespace-pre-wrap line-clamp-3">{featureRequest.content}</p>
      </div>

      <FeatureRequestTabs projectId={projectId} requestId={requestId} />

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}
