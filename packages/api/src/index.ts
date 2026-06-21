import { router } from "./trpc";
import { featureRequestRouter } from "./routers/featureRequest";

export const appRouter = router({
  featureRequest: featureRequestRouter,
});

export type AppRouter = typeof appRouter;
