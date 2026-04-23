import { z } from "zod";
export const createUserSchema = z.object({
  username: z.string().min(3).max(4),
  password: z.string(),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
});
