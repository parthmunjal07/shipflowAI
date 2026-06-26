-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "FeatureRequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'DUPLICATE_DETECTED', 'PLANNED', 'IN_PROGRESS', 'READY_FOR_APPROVAL', 'SHIPPED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeatureRequestSource" AS ENUM ('FORM', 'EMAIL', 'TICKET', 'CALL');

-- CreateEnum
CREATE TYPE "ClarificationStatus" AS ENUM ('NONE', 'AWAITING_RESPONSE', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ProcessingState" AS ENUM ('IDLE', 'ANALYZING_INTAKE', 'GENERATING_PRD', 'GENERATING_TASKS');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('FRONTEND', 'BACKEND', 'INFRA', 'DESIGN', 'FULLSTACK');

-- CreateEnum
CREATE TYPE "TaskEffort" AS ENUM ('S', 'M', 'L', 'XL');

-- CreateEnum
CREATE TYPE "PRReviewStatus" AS ENUM ('PENDING', 'AWAITING_TASK_LINK', 'APPROVED', 'NEEDS_FIX');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('APPROVAL_GRANTED', 'ROLE_CHANGED', 'BILLING_UPGRADED', 'BILLING_CANCELLED', 'MEMBER_INVITED', 'MEMBER_REMOVED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "razorpayCustomerId" TEXT,
    "razorpaySubscriptionId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "aiReviewsUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "intakeToken" TEXT,
    "publicIntakeEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_request" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "FeatureRequestStatus" NOT NULL DEFAULT 'PENDING',
    "source" "FeatureRequestSource" NOT NULL,
    "sourceMetadata" JSONB,
    "submitterEmail" TEXT,
    "submitterName" TEXT,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT,
    "isSpecificEnough" BOOLEAN,
    "missingDimensions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followUpQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clarificationStatus" "ClarificationStatus" NOT NULL DEFAULT 'NONE',
    "processingState" "ProcessingState" NOT NULL DEFAULT 'IDLE',
    "embedding" vector(1024),
    "duplicateOfId" TEXT,
    "duplicateNote" TEXT,
    "duplicateSimilarity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prd" (
    "id" TEXT NOT NULL,
    "featureRequestId" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "goals" TEXT[],
    "nonGoals" TEXT[],
    "userStories" TEXT[],
    "acceptanceCriteria" TEXT[],
    "edgeCases" TEXT[],
    "successMetrics" TEXT[],
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "planApprovedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarification_message" (
    "id" TEXT NOT NULL,
    "featureRequestId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clarification_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "featureRequestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "category" "TaskCategory" NOT NULL,
    "effort" "TaskEffort",
    "satisfiedAcceptanceCriteria" TEXT[],
    "traceabilityNotes" TEXT,
    "assigneeId" TEXT,
    "linkedPrUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_installation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "installationId" INTEGER NOT NULL,
    "accountName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_install_state" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_install_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_repository" (
    "id" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "repoId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_repository" (
    "projectId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_repository_pkey" PRIMARY KEY ("projectId","repositoryId")
);

-- CreateTable
CREATE TABLE "github_webhook_log" (
    "id" TEXT NOT NULL,
    "githubEvent" TEXT NOT NULL,
    "githubAction" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_webhook_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pull_request" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "reviewStatus" "PRReviewStatus" NOT NULL DEFAULT 'PENDING',
    "url" TEXT NOT NULL,
    "authorLogin" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mergedAt" TIMESTAMP(3),

    CONSTRAINT "pull_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_run" (
    "id" TEXT NOT NULL,
    "pullRequestId" TEXT NOT NULL,
    "headSha" TEXT NOT NULL,
    "conclusion" "PRReviewStatus" NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_issue" (
    "id" TEXT NOT NULL,
    "reviewRunId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "isBlocking" BOOLEAN NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "review_issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" "AuditEventType" NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TaskPullRequests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskPullRequests_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_intakeToken_key" ON "project"("intakeToken");

-- CreateIndex
CREATE UNIQUE INDEX "prd_featureRequestId_key" ON "prd"("featureRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "task_projectId_number_key" ON "task"("projectId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "github_installation_organizationId_key" ON "github_installation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "github_installation_installationId_key" ON "github_installation"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "github_install_state_token_key" ON "github_install_state"("token");

-- CreateIndex
CREATE UNIQUE INDEX "github_repository_repoId_key" ON "github_repository"("repoId");

-- CreateIndex
CREATE UNIQUE INDEX "pull_request_githubId_key" ON "pull_request"("githubId");

-- CreateIndex
CREATE INDEX "_TaskPullRequests_B_index" ON "_TaskPullRequests"("B");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_request" ADD CONSTRAINT "feature_request_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_request" ADD CONSTRAINT "feature_request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_request" ADD CONSTRAINT "feature_request_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "feature_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prd" ADD CONSTRAINT "prd_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "feature_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarification_message" ADD CONSTRAINT "clarification_message_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "feature_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "feature_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_installation" ADD CONSTRAINT "github_installation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_repository" ADD CONSTRAINT "github_repository_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "github_installation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_repository" ADD CONSTRAINT "project_repository_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_repository" ADD CONSTRAINT "project_repository_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "github_repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_request" ADD CONSTRAINT "pull_request_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "github_repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_run" ADD CONSTRAINT "review_run_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "pull_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_issue" ADD CONSTRAINT "review_issue_reviewRunId_fkey" FOREIGN KEY ("reviewRunId") REFERENCES "review_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskPullRequests" ADD CONSTRAINT "_TaskPullRequests_A_fkey" FOREIGN KEY ("A") REFERENCES "pull_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskPullRequests" ADD CONSTRAINT "_TaskPullRequests_B_fkey" FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
