import { sendVerificationRequest } from "./sendgrid";
import { prisma } from "../db/prisma";
export async function sendEmail(
  email: string,
  content: string,
  subject: string
) {
  const count = await getCount();
  const user = getUser(count);
  const provider = {
    server: {
      host: process.env.EMAIL_SERVER_HOST as string,
      port: Number(process.env.EMAIL_EMAIL_SERVER_PORT),
      auth: {
        user,
        pass: process.env.EMAIL_SERVER_PASSWORD as string,
      },
    },
    from: process.env.EMAIL_FROM as string,
  };
  await sendVerificationRequest({
    identifier: email,
    provider,
    subject: subject,
    html: content,
    text: "",
  });
  await updateCount(count + 1);
}

export const getUser = (count: number) => {
  const user1 = process.env.EMAIL_SERVER_USER1 as string;
  const user2 = process.env.EMAIL_SERVER_USER2 as string;
  const user3 = process.env.EMAIL_SERVER_USER3 as string;
  const user4 = process.env.EMAIL_SERVER_USER4 as string;
  const user5 = process.env.EMAIL_SERVER_USER5 as string;
  const queue = [user1,user2,user3,user4,user5];
  return queue[count % 5];
};

export const getCount = async () => {
  const emailMonitor = await prisma.emailMonitor.findFirst({});
  if (!emailMonitor) return 0;
  let count = emailMonitor.count;
  return count;
};

export const updateCount = async (count: number) => {
  await prisma.emailMonitor.update({
    where: { id: 1 },
    data: { count: count + 1 },
  });
};
