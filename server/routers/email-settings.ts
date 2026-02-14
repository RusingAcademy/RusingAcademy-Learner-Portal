/**
 * Email Settings Router
 * 
 * Provides admin endpoints for managing email configuration
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getEmailServiceStatus, verifyEmailConnection, sendEmailViaSMTP } from "../email-service";

export const emailSettingsRouter = router({
  /**
   * Get current email service status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    // Only allow owner to view email settings
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the owner can view email settings",
      });
    }
    
    return getEmailServiceStatus();
  }),
  
  /**
   * Test email connection
   */
  testConnection: protectedProcedure.mutation(async ({ ctx }) => {
    // Only allow owner to test email connection
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the owner can test email connection",
      });
    }
    
    return verifyEmailConnection();
  }),
  
  /**
   * Send a test email
   */
  sendTestEmail: protectedProcedure
    .input(z.object({
      to: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Only allow owner to send test emails
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can send test emails",
        });
      }
      
      const result = await sendEmailViaSMTP({
        to: input.to,
        subject: "Lingueefy Email Test",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Email Configuration Test</h1>
              </div>
              <div class="content">
                <div class="success">
                  <strong>✓ Success!</strong> Your email configuration is working correctly.
                </div>
                <p>This is a test email from Lingueefy to verify your SMTP settings are configured properly.</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Sent to:</strong> ${input.to}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                  If you received this email, your email service is configured correctly and ready to send 
                  verification emails, password reset links, and booking confirmations.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Email Configuration Test - Success!

This is a test email from Lingueefy to verify your SMTP settings are configured properly.

Timestamp: ${new Date().toISOString()}
Sent to: ${input.to}

If you received this email, your email service is configured correctly and ready to send 
verification emails, password reset links, and booking confirmations.
        `.trim(),
      });
      
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Failed to send test email",
        });
      }
      
      return {
        success: true,
        messageId: result.messageId,
      };
    }),
  
  /**
   * Get SMTP configuration guide
   */
  getConfigurationGuide: protectedProcedure.query(async ({ ctx }) => {
    // Only allow owner to view configuration guide
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the owner can view email configuration",
      });
    }
    
    return {
      requiredVariables: [
        {
          name: "SMTP_HOST",
          description: "SMTP server hostname",
          examples: [
            "smtp.sendgrid.net",
            "smtp.mailgun.org",
            "email-smtp.us-east-1.amazonaws.com",
            "smtp.postmarkapp.com",
          ],
        },
        {
          name: "SMTP_PORT",
          description: "SMTP server port (default: 587)",
          examples: ["587", "465", "25"],
        },
        {
          name: "SMTP_USER",
          description: "SMTP username or API key",
          examples: ["apikey", "your-api-key"],
        },
        {
          name: "SMTP_PASS",
          description: "SMTP password or API secret",
          examples: ["your-api-secret"],
        },
        {
          name: "SMTP_FROM",
          description: "Sender email address",
          examples: ["noreply@yourdomain.com", "support@rusingacademy.ca"],
        },
        {
          name: "SMTP_FROM_NAME",
          description: "Sender display name",
          examples: ["Lingueefy", "RusingAcademy"],
        },
        {
          name: "SMTP_SECURE",
          description: "Use SSL instead of TLS (default: false)",
          examples: ["true", "false"],
        },
      ],
      providers: [
        {
          name: "SendGrid",
          host: "smtp.sendgrid.net",
          port: 587,
          userNote: "Use 'apikey' as username",
          passNote: "Use your SendGrid API key as password",
          docs: "https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api",
        },
        {
          name: "Mailgun",
          host: "smtp.mailgun.org",
          port: 587,
          userNote: "Use your Mailgun SMTP username",
          passNote: "Use your Mailgun SMTP password",
          docs: "https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp",
        },
        {
          name: "Amazon SES",
          host: "email-smtp.{region}.amazonaws.com",
          port: 587,
          userNote: "Use your SES SMTP username",
          passNote: "Use your SES SMTP password",
          docs: "https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html",
        },
        {
          name: "Postmark",
          host: "smtp.postmarkapp.com",
          port: 587,
          userNote: "Use your Postmark Server API Token",
          passNote: "Use your Postmark Server API Token",
          docs: "https://postmarkapp.com/developer/user-guide/send-email-with-smtp",
        },
        {
          name: "Resend",
          host: "smtp.resend.com",
          port: 587,
          userNote: "Use 'resend' as username",
          passNote: "Use your Resend API key",
          docs: "https://resend.com/docs/send-with-smtp",
        },
      ],
    };
  }),
});
