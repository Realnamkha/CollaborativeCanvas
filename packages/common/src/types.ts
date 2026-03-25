import { z } from "zod";
export const createUserSchema = z.object({
  username: z.string().min(3).max(4),
  password: z.string(),
});
