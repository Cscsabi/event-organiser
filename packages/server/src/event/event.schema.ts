import { EventType } from "@prisma/client";
import { z } from "zod";

export const addEventInput = z.object({
  name: z.string(),
  type: z.nativeEnum(EventType).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number(),
  headcount: z.number().optional(),
  description: z.string().optional(),
  userEmail: z.string(),
  locationId: z.string(),
  decorNeeded: z.boolean(),
  menuNeeded: z.boolean(),
  performerNeeded: z.boolean(),
});

export const updateEventInput = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(EventType).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().optional(),
  headcount: z.number().optional(),
  userEmail: z.string(),
  locationId: z.string(),
  decorNeeded: z.boolean(),
  menuNeeded: z.boolean(),
  performerNeeded: z.boolean(),
});

export type AddEventInput = z.TypeOf<typeof addEventInput>;
export type UpdateEventInput = z.TypeOf<typeof updateEventInput>;
