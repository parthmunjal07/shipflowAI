import { router } from "./trpc";
import { featureRequestRouter } from "./routers/featureRequest";
import { githubRouter } from "./routers/github";
import { billingRouter } from "./routers/billing";
import { projectRouter } from "./routers/project";
import { pullRequestRouter } from "./routers/pullRequest";

export const appRouter = router({
  featureRequest: featureRequestRouter,
  github: githubRouter,
  billing: billingRouter,
  project: projectRouter,
  pullRequest: pullRequestRouter,
});

export type AppRouter = typeof appRouter;
