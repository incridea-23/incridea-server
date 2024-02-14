import { pubsub } from "../pubsub";
import { hashToken } from "../utils/auth/hashToken";
import { prisma } from "../utils/db/prisma";
import * as cron from "node-cron";
// used when we create a refresh token.
interface TimerData {
  remainingTime: number;
  started: boolean;
  eventId: number;
}
export let QuizTimer = new Map<string, TimerData>();
QuizTimer.set("clsc0uscc0000ildomyo9x69a", {
  started: true,
  remainingTime: 30,
  eventId: 3,
});

export function addRefreshTokenToWhitelist({
  jti,
  refreshToken,
  userId,
}: {
  jti: string;
  refreshToken: string;
  userId: number;
}) {
  return prisma.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId,
    },
  });
}

// used to check if the token sent by the client is in the database.
export function findRefreshTokenById(id: string) {
  return prisma.refreshToken.findUnique({
    where: {
      id,
    },
  });
}

// soft delete tokens after usage.
export function revokeRefreshToken(id: string) {
  return prisma.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

export function revokeTokens(userId: number) {
  return prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });
}

export function addVerificationTokenToWhitelist({
  userId,
}: {
  userId: number;
}) {
  return prisma.verificationToken.create({
    data: {
      userId,
    },
  });
}

export function findVerificationTokenByID(id: string) {
  return prisma.verificationToken.findUnique({
    where: {
      id,
    },
  });
}

export function revokeVerificationToken(id: string) {
  return prisma.verificationToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

export function addPasswordResetTokenToWhitelist({
  userId,
}: {
  userId: number;
}) {
  return prisma.verificationToken.create({
    data: {
      userId,
      type: "RESET_PASSWORD",
    },
  });
}

export function findPasswordResetTokenByID(id: string) {
  return prisma.verificationToken.findUnique({
    where: {
      id,
    },
  });
}

export function revokePasswordResetToken(id: string) {
  return prisma.verificationToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

//node-cron setup to delete revoked token every 12 hours
cron.schedule("0 */12 * * *", async () => {
  await prisma.refreshToken.deleteMany({
    where: {
      revoked: true,
    },
  });
  await prisma.verificationToken.deleteMany({
    where: {
      revoked: true,
    },
  });
  console.log("cron job running: deleted revoked tokens");
});

cron.schedule("*/1 * * * *", async () => {
  QuizTimer.forEach((value, key) => {
    if (value.started && value.remainingTime >= 0) {
      QuizTimer.set(key, {
        remainingTime: value.remainingTime - 1,
        started: true,
        eventId: 3,
      });
    } else if (value.remainingTime < 0) {
      QuizTimer.delete(key);
    }
    pubsub.publish(`QUIZ_TIME_UPDATE/${value.eventId}`, value);
  });
  console.log(QuizTimer);
  console.log("updating quiz time left");
});
