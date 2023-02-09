import jwt from "jsonwebtoken";
export const AUTH_SECRET = process.env.AUTH_SECRET as string;

export const secrets = {
  JWT_ACCESS_SECRET: AUTH_SECRET + "access",
  JWT_REFRESH_SECRET: AUTH_SECRET + "refresh",
  JWT_VERIFICATION_SECRET: AUTH_SECRET + "verification",
};

export function generateAccessToken(user: { id: any }) {
  return jwt.sign({ userId: user.id }, secrets.JWT_ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(user: { id: any }, jti: any) {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    secrets.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
}

export function generateTokens(user: { id: any }, jti: any) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}

export function generateVerificationToken(user: { id: any }, jti: any) {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    secrets.JWT_VERIFICATION_SECRET as string,
    {
      expiresIn: "1d",
    }
  ) as string;
}
