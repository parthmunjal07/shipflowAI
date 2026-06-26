"use server";

import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createFeatureRequest(projectId: string, title: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Create the feature request
  const request = await prisma.featureRequest.create({
    data: {
      title,
      content,
      projectId,
      createdById: session.user.id,
      submitterName: session.user.name,
      submitterEmail: session.user.email,
      source: "FORM",
      status: "PENDING",
      processingState: "IDLE"
    }
  });

  revalidatePath("/"); // Revalidate everything to be safe
  return { success: true, id: request.id };
}
