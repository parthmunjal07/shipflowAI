import { router } from "./trpc";
import { featureRequestRouter } from "./routers/featureRequest";
import { githubRouter } from "./routers/github";

export const appRouter = router({
  featureRequest: featureRequestRouter,
  github: githubRouter,
});

export type AppRouter = typeof appRouter;
