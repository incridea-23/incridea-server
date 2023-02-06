import { Http2ServerRequest } from "http2";

const jwt = require("jsonwebtoken");
export const AUTH_SECRET = process.env.AUTH_SECRET as string;

function getTokenPayload(token: string) {
  return jwt.verify(token, AUTH_SECRET);
}

function getUserId(req: Http2ServerRequest, authToken: string) {
  if (req) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (!token) {
        throw new Error("No token found");
      }
      const { userId } = getTokenPayload(token);
      return userId;
    }
  } else if (authToken) {
    const { userId } = getTokenPayload(authToken);
    return userId;
  }

  throw new Error("Not authenticated");
}

function signIn(userId: number) {
  return jwt.sign({ userId }, AUTH_SECRET);
}

module.exports = {
  AUTH_SECRET,
  getUserId,
  signIn,
};
