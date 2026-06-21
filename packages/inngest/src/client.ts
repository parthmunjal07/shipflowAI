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
};

export const inngest = new Inngest({
  id: "shipflow-ai",
  schemas: new Map() as any, // typed via generic
}) as Inngest;

// Re-export typed send helper
export type { Events };
