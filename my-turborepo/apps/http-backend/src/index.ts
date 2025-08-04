import express from "express";
import { Response, Request } from "express";
const app = express();

app.listen(3001);

app.post("/signup", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ message: "Email or Password is missing" });
  }
  try {
  } catch (error) {}
});

app.post("/signin", (req: Request, res: Response) => {
  const { email, password } = req.body;
  return res.json({
    message: email,
    token: "qdas13",
  });
});

app.post("/room", (req: Request, res: Response) => {
  const { email, password } = req.body;
  return res.json({
    message: email,
    token: "qdas13",
  });
});
