import { router } from "./trpc";
import { featureRequestRouter } from "./routers/featureRequest";
import { githubRouter } from "./routers/github";
import { billingRouter } from "./routers/billing";
import { projectRouter } from "./routers/project";

export const appRouter = router({
  featureRequest: featureRequestRouter,
  github: githubRouter,
  billing: billingRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
