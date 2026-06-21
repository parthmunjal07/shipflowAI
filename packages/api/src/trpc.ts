import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";

export const createContext = async (opts: any) => {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  return {
    prisma,
    session,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
