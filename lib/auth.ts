import jwt from "jsonwebtoken";

const AUTH_SECRET = process.env.AUTH_SECRET!;

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, AUTH_SECRET) as {
      userId: string;
      email?: string;
    };
  } catch {
    return null;
  }
}
