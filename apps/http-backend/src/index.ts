import express from "express";
import { prismaClient } from "@repo/db/client";

const app = express();
app.use(express.json());
app.post("/add-user", async (req, res) => {
  const { email, password, name, photo } = req.body;

  try {
    const newUser = await prismaClient.user.create({
      data: {
        email,
        password,
        name,
        photo, // optional
      },
    });

    res.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.listen(3001, () => {
  console.log("App is running on", process.env.PORT);
});
