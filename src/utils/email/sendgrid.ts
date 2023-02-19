import { createTransport } from "nodemailer";

export async function sendVerificationRequest(params: {
  text: string;
  html: string;
  identifier: string;
  provider: {
    server: {
      host: string;
      port: number;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
  };
  subject: string;
}) {
  const { identifier, provider, subject, text, html } = params;

  const transport = createTransport(provider.server);
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: subject,
    text: text,
    html: html,
  });
  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}
