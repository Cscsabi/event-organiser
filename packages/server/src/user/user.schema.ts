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
      darkModeEnabled: z.boolean(),
      language: z.string(),
    })
    .partial(),
});

export const filterQuery = z.object({
  limit: z.number().default(1),
  page: z.number().default(10),
});

export const sendEmailInput = z.object({
  subject: z.string(),
  text: z.string(),
  html: z.string(),
  email: z.string(),
  name: z.string().optional(),
});

export const sendEmailWithAttachmentInput = z.object({
  senderFirstname: z.string(),
  senderLastname: z.string(),
  subject: z.string(),
  text: z.string(),
  html: z.string(),
  email: z.string(),
  name: z.string().optional(),
  filename: z.string(),
  contentType: z.string(),
  base64Content: z.string(),
});

export type ParamsInput = z.TypeOf<typeof params>;
export type FilterQueryInput = z.TypeOf<typeof filterQuery>;
export type CreateUserInput = z.TypeOf<typeof createUserSchema>;
export type UpdateUserInput = z.TypeOf<typeof updateUserSchema>;
export type SendEmailInput = z.TypeOf<typeof sendEmailInput>;
export type SendEmailWithAttachmentInput = z.TypeOf<
  typeof sendEmailWithAttachmentInput
>;
