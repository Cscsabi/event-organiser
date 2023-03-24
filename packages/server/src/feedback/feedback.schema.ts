import { z } from "zod";

export const getFeedbackInput = z.object({
  guestEmail: z.string(),
  eventId: z.string(),
});

export const addFeedbackInput = z.object({
  eventId: z.string(),
  guestEmail: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  lactose: z.boolean(),
  gluten: z.boolean(),
  diabetes: z.boolean(),
  plusOne: z.boolean(),
  additional: z.string().optional(),
});

export type AddFeedbackInput = z.TypeOf<typeof addFeedbackInput>;
export type GetFeedbackInput = z.TypeOf<typeof getFeedbackInput>;
