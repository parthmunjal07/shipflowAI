import { Inngest } from "inngest";

type Events = {
  "the-wharf/feature-request.created": {
    data: {
      featureRequestId: string;
      projectId: string;
      title: string;
      content: string;
    };
  };
  "the-wharf/clarification.answered": {
    data: {
      featureRequestId: string;
      answers: string;
      round: number;
    };
  };
  "the-wharf/prd.generate": {
    data: { featureRequestId: string };
  };
  "the-wharf/prd.generate-tasks": {
    data: { featureRequestId: string };
  };
  "github/pull_request.opened": {
    data: {
      payload: any;
    };
  };
  "github/pull_request.synchronize": {
    data: {
      payload: any;
    };
  };
  "github/pull_request.edited": {
    data: {
      payload: any;
    };
  };
  "github/pull_request.closed": {
    data: {
      payload: any;
    };
  };
  "the-wharf/pr.review-requested": {
    data: {
      pullRequestId: string;
      githubInstallationDbId: string;
      owner: string;
      repo: string;
      pullNumber: number;
      headSha: string;
    };
  };
  "the-wharf/duplicate.responded": {
    data: {
      featureRequestId: string;
      action: "merge" | "proceed" | "revise";
      revisedContent?: string;
    };
  };
  "the-wharf/feature-request.resolved": {
    data: {
      featureRequestId: string;
    };
  };
};

export const inngest = new Inngest({
  id: "the-wharf-ai",
  schemas: new Map() as any, // typed via generic
}) as Inngest;

// Re-export typed send helper
export type { Events };
