import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("All cookies:", req.cookies); // ← see what cookies arrive
  console.log("Token:", req.cookies.token);
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};

export default authMiddleware;
