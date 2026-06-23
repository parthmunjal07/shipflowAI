import { router } from "./trpc";
import { featureRequestRouter } from "./routers/featureRequest";
import { githubRouter } from "./routers/github";
import { billingRouter } from "./routers/billing";

export const appRouter = router({
  featureRequest: featureRequestRouter,
  github: githubRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
