import { z } from "zod";

export const budgetPlanningInput = z.object({
  id: z.number(),
  contactId: z.string(),
  amount: z.number().optional(),
  isPaid: z.boolean(),
  eventId: z.string(),
  description: z.string().optional(),
});

export const contactInput = z.object({
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
  userEmail: z.string(),
});

export const updateContactInput = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number(),
  phone: z.string(),
  email: z.string(),
  description: z.string(),
  userEmail: z.string(),
});

export const getBudgetPlanningInput = z.object({
  eventId: z.string(),
  contactId: z.string(),
});

export type BudgetPlanningInput = z.TypeOf<typeof budgetPlanningInput>;
export type ContactInput = z.TypeOf<typeof contactInput>;
export type UpdateContactInput = z.TypeOf<typeof updateContactInput>;
export type GetBudgetPlanningInput = z.TypeOf<typeof getBudgetPlanningInput>;
