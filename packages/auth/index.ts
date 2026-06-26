import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "@repo/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    organization({
      sendInvitationEmail: async (data, request) => {
        const inviteLink = `${process.env.BETTER_AUTH_URL}/accept-invite/${data.id}`;
        
        if (!process.env.RESEND_API_KEY) {
          if (process.env.NODE_ENV === "production") {
            throw new Error("RESEND_API_KEY is not configured in production");
          }
          console.log("\n==============================================");
          console.log("[DEV] Invitation link generated!");
          console.log(`Role: ${data.role}`);
          console.log(`Email: ${data.email}`);
          console.log(`Invite link: ${inviteLink}`);
          console.log("==============================================\n");
          return;
        }

        if (resend) {
          await resend.emails.send({
            from: "ShipFlow AI <invites@resend.dev>", // resend.dev for testing, update to verified domain later
            to: data.email,
            subject: "You have been invited to join a workspace",
            html: `<p>You have been invited to join an organization with the role <strong>${data.role}</strong>.</p>
                   <p><a href="${inviteLink}">Click here to accept the invitation</a></p>`,
          });
        }
      }
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
