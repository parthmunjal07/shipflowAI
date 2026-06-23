import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { PERMISSIONS, PermissionAction, hasPermission } from "./permissions";

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

export const orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const activeOrganizationId = ctx.session.session.activeOrganizationId;
  if (!activeOrganizationId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You must select an active organization to perform this action." 
    });
  }

  const member = await ctx.prisma.member.findFirst({
    where: {
      organizationId: activeOrganizationId,
      userId: ctx.session.user.id
    }
  });

  if (!member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of the active organization."
    });
  }

  return next({
    ctx: {
      ...ctx,
      activeOrganizationId,
      memberRole: member.role,
    },
  });
});

export const requirePermission = (action: PermissionAction) =>
  orgProcedure.use(({ ctx, next }) => {
    const minRole = PERMISSIONS[action];
    if (!hasPermission(ctx.memberRole, minRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have the required role to perform this action. Required: ${minRole}`,
      });
    }
    return next({ ctx });
  });

export const publicIntakeProcedure = t.procedure.use(({ ctx, next }) => {
  // We can add global rate limiting or simple abuse detection here in the future
  return next({
    ctx,
  });
});
