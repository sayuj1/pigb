import { parse } from "cookie";
import jwt from "jsonwebtoken";

export function getUserFromCookie(req) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}
