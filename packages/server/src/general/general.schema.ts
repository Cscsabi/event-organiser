import { z } from "zod";

export const getByEmailInput = z.object({
  email: z.string(),
});

export const getByIdInput = z.object({
  id: z.string(),
});

export type GetByIdInput = z.TypeOf<typeof getByIdInput>;
export type GetByEmailInput = z.TypeOf<typeof getByEmailInput>;
