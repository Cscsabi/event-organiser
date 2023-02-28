import { z } from "zod";

export const budgetPlanningInput = z.object({
  contactName: z.string(),
  contactId: z.string(),
  amount: z.number(),
  isPaid: z.boolean(),
  eventId: z.string(),
  description: z.string(),
});

export const contactInput = z.object({
  name: z.string(),
  cost: z.number(),
  phone: z.string(),
  email: z.string(),
  description: z.string(),
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
