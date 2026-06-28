import { Inngest } from "inngest";

type Events = {
  "shipflow/feature-request.created": {
    data: {
      featureRequestId: string;
      projectId: string;
      title: string;
      content: string;
    };
  };
  "shipflow/clarification.answered": {
    data: {
      featureRequestId: string;
      answers: string;
      round: number;
    };
  };
  "shipflow/prd.generate": {
    data: { featureRequestId: string };
  };
  "shipflow/prd.generate-tasks": {
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
  "shipflow/pr.review-requested": {
    data: {
      pullRequestId: string;
      githubInstallationDbId: string;
      owner: string;
      repo: string;
      pullNumber: number;
      headSha: string;
    };
  };
  "shipflow/duplicate.responded": {
    data: {
      featureRequestId: string;
      action: "merge" | "proceed" | "revise";
      revisedContent?: string;
    };
  };
  "shipflow/feature-request.resolved": {
    data: {
      featureRequestId: string;
    };
  };
};

export const inngest = new Inngest({
  id: "shipflow-ai",
  schemas: new Map() as any, // typed via generic
}) as Inngest;

// Re-export typed send helper
export type { Events };
