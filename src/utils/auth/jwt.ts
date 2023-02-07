import jwt from "jsonwebtoken";

export function generateAccessToken(user: { id: any }) {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    }
  );
}

export function generateRefreshToken(user: { id: any }, jti: any) {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    process.env.JWT_REFRESH_SECRET as string,
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
