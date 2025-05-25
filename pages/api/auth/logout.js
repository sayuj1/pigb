import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method === "GET" || req.method === "POST") {
    res.setHeader(
      "Set-Cookie",
      serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
      })
    );
    return res.status(200).json({ message: "Logged out successfully" });
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
