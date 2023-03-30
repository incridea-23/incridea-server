import { hashToken } from "../utils/auth/hashToken";
import { prisma } from "../utils/db/prisma";
// used when we create a refresh token.
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
    data:{
      revoked: true,
    }
  });
}

export function revokeTokens(userId: number) {
  return prisma.refreshToken.deleteMany({
    where: {
      userId,
    }
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

export function deleteVerificationToken(id: string) {
  return prisma.verificationToken.delete({
    where: {
      id,
    }
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

export function deletePasswordResetToken(id: string) {
  return prisma.verificationToken.delete({
    where: {
      id,
    }
  });
}
