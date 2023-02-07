import jwt from "jsonwebtoken";
import crypto from "crypto";

function generateAccessToken(user: { id: any }) {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    }
  );
}

function generateRefreshToken(user: { id: any }, jti: any) {
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

function generateTokens(user: { id: any }, jti: any) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
};
