import { z } from "zod";

export const getByEmailInput = z.object({
  email: z.string(),
});

export const byIdInput = z.object({
  id: z.string(),
});

export const byNoInput = z.object({
  id: z.number(),
});

export type ByIdInput = z.TypeOf<typeof byIdInput>;
export type GetByEmailInput = z.TypeOf<typeof getByEmailInput>;
export type ByNoInput = z.TypeOf<typeof byNoInput>;
