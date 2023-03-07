import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string({
    required_error: "Email is required",
  }),
  firstname: z.string({
    required_error: "Firstname is required",
  }),
  lastname: z.string({
    required_error: "Lastname is required",
  }),
  darkModeEnabled: z.boolean(),
});

export const params = z.object({
  email: z.string(),
});

export const updateUserSchema = z.object({
  params,
  body: z
    .object({
      firstname: z.string(),
      lastname: z.string(),
      password: z.string(),
      email: z.string(),
      notifications: z.boolean(),
      darkModeEnabled: z.boolean(),
    })
    .partial(),
});

export const filterQuery = z.object({
  limit: z.number().default(1),
  page: z.number().default(10),
});

export type ParamsInput = z.TypeOf<typeof params>;
export type FilterQueryInput = z.TypeOf<typeof filterQuery>;
export type CreateUserInput = z.TypeOf<typeof createUserSchema>;
export type UpdateUserInput = z.TypeOf<typeof updateUserSchema>;
