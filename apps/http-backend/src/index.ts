import express, { NextFunction, Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import authMiddleware from "./middleware/AuthMiddleware";
import { CreateRoomSchema } from "@repo/common/types";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET is not set in environment variables");

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// ---- Helpers ----
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ---- Sign Up ----
app.post("/sign-up", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prismaClient.user.create({
      data: { name: "default", email, password: hashedPassword },
      select: { id: true, email: true }, // never return password
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (err: any) {
    console.error("[sign-up error]", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const token = req.cookies.token;
  res.json({ userId: req.userId, token });
});

// ---- Sign In ----
app.post("/sign-in", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅
      maxAge: 60 * 60 * 1000,
    });

    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error("[sign-in error]", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/room", authMiddleware, async (req, res) => {
  const parsed = CreateRoomSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsed.data.name,
        adminId: req.userId!,
      },
    });

    res.status(201).json({ roomId: room.id, slug: room.slug });
  } catch (e: any) {
    if (e.code === "P2002") {
      res.status(409).json({ error: "Room with this name already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create room" });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { id: "desc" },
      take: 50,
    });
    res.json({ messages });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/room/:slug", authMiddleware, async (req, res) => {
  try {
    const slug = req.params.slug;
    const room = await prismaClient.room.findUnique({
      where: { slug },
    });

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.json({ room });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/sign-out", (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅
  });
  res.json({ success: true });
});
app.listen(3001, () => {
  console.log("App is running on", 3001);
});
