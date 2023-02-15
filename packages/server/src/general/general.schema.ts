import { z } from "zod";

export const getByEmailInput = z.object({
  email: z.string(),
});

export const byIdInput = z.object({
  id: z.string(),
});

export type ByIdInput = z.TypeOf<typeof byIdInput>;
export type GetByEmailInput = z.TypeOf<typeof getByEmailInput>;
