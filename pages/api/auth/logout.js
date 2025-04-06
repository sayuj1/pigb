import {serialize} from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).setHeader(
      "Set-Cookie",
      serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
      })
    ).json({ message: "Logged out successfully" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
