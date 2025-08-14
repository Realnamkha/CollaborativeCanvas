import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();

app.post("/signup", (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json({
    message: "account created",
  });
});

app.post("/signin", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userId = 1;
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  res.json({
    token,
  });
});

app.post("/create-room", () => {});

app.listen(3000, () => {
  console.log("app is runig on 3001");
});
