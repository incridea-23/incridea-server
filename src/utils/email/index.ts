import { sendVerificationRequest } from "./sendgrid";

export async function sendEmail(
  email: string,
  content: string,
  subject: string
) {
  const provider = {
    server: {
      host: process.env.EMAIL_SERVER_HOST as string,
      port: Number(process.env.EMAIL_EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER as string,
        pass: process.env.EMAIL_SERVER_PASSWORD as string,
      },
    },
    from: process.env.EMAIL_FROM as string,
  };
  await sendVerificationRequest({
    identifier: email,
    provider,
    subject: subject,
    text: content,
    html: content,
  });
}
