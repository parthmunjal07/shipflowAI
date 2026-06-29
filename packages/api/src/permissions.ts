export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.OWNER]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.MEMBER]: 1,
};

export function hasPermission(userRole: string, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

export const PERMISSIONS = {
  // Member actions (default for org members, but listed for clarity)
  UPDATE_TASK_STATUS: ROLES.MEMBER,
  SUBMIT_CLARIFICATION: ROLES.MEMBER,
  CREATE_FEATURE_REQUEST: ROLES.MEMBER,
  VIEW_ORG_DATA: ROLES.MEMBER,
  CREATE_PROJECT: ROLES.MEMBER,
  LINK_REPOS: ROLES.MEMBER,

  // Admin actions
  APPROVE_PLAN: ROLES.ADMIN,
  GENERATE_TASKS: ROLES.ADMIN,
  UPDATE_PRD: ROLES.ADMIN,
  FINALIZE_PRD: ROLES.ADMIN,
  UPDATE_STATUS: ROLES.ADMIN, // Final release approval

  // Owner actions
  MANAGE_INSTALLATIONS: ROLES.OWNER,
  MANAGE_MEMBERS: ROLES.OWNER,
  MANAGE_BILLING: ROLES.OWNER,
} as const;

export type PermissionAction = keyof typeof PERMISSIONS;
