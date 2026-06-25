# Security & Data Handling Overview

This document outlines how ShipFlow AI handles, isolates, and protects customer data. It is designed to provide transparency for security reviews and compliance audits.

## 1. What Data We Store

ShipFlow AI operates on a principle of **data minimization**. We only store the data strictly necessary to facilitate product planning, task generation, and automated pull request reviews.

### Product Data
- **Feature Requests**: Titles, descriptions, source metadata (e.g., ticket links), and AI clarification transcripts.
- **Product Requirements Documents (PRDs)**: Generated acceptance criteria, user stories, and problem statements.
- **Tasks**: Granular engineering tasks and assignment metadata.

### Source Code & GitHub Integration
**ShipFlow AI DOES NOT store your source code.**
- We store GitHub Installation IDs to request short-lived, scoped access tokens dynamically.
- When a Pull Request is opened, we fetch the diff (patch) on the fly via the GitHub API and hold it in volatile memory during the AI analysis phase.
- We store **PR Metadata** (Title, PR Number, Author, URL, Status).
- We store **Code Snippets** specifically flagged by the AI as requiring a comment or change (limited to the lines surrounding the issue).

### User Data
- User names, email addresses, and OAuth profile pictures.
- Role-based access control (RBAC) assignments within Organizations.

---

## 2. How Data is Isolated

ShipFlow AI is a multi-tenant SaaS application designed with strict tenant isolation protocols.

### Logical Tenant Isolation
Every customer is assigned an `Organization` (Tenant). All relational data (Projects, Feature Requests, Tasks, GitHub Installations) is strictly bound to an `organizationId`.
- **API Level**: All tRPC routers and REST API endpoints enforce a mandatory middleware check. A user's session token is validated against their active `organizationId`, and all database queries implicitly enforce `where: { organizationId: session.orgId }`.
- **Cross-Tenant Prevention**: It is structurally impossible for a user in Tenant A to query data in Tenant B, as the backend enforces tenant-scoping at the ORM query builder level.

### AI Processing Isolation
- All interactions with Large Language Models (LLMs) are stateless.
- We do not use customer data (including Feature Requests, PRDs, or Source Code Snippets) to fine-tune or train our proprietary or third-party AI models.
- LLM API requests are ephemeral; once the API response is returned, the prompt data is purged from the LLM provider's processing queue (in accordance with OpenAI/Mistral Zero Data Retention policies).

---

## 3. How Data is Deleted

We support full "Right to Be Forgotten" compliance under GDPR and CCPA.

### Cascading Deletion
Our database schema is configured with strict `ON DELETE CASCADE` constraints.
- When an `Organization` is deleted, all child records (Projects, Feature Requests, PRDs, Tasks, Members, and GitHub links) are immediately and permanently wiped from the database.
- When a `Project` is deleted, all associated tasks, feature requests, and pull request tracking data are wiped.

### Backup Retention
- Automated database backups are retained for a maximum of **30 days**.
- If a customer deletes their organization, their data will be permanently irretrievable from our active database immediately, and fully expunged from all cold-storage backups after 30 days.

### GitHub Revocation
- If a customer uninstalls the ShipFlow AI GitHub App via their GitHub settings, our webhook immediately processes an `installation_deleted` event and destroys the corresponding `GithubInstallation` record in our database, severing all future access.
