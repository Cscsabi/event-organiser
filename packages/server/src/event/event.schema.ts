import { EventType } from "@prisma/client";
import { boolean, z } from "zod";

export const addEventInput = z.object({
  name: z.string(),
  type: z.nativeEnum(EventType),
  startDate: z.date(),
  endDate: z.date(),
  budget: z.number(),
  headcount: z.number(),
  userEmail: z.string(),
  locationId: z.string(),
  decorNeeded: z.boolean(),
  menuNeeded: z.boolean(),
  performerNeeded: z.boolean(),
});

export const updateEventInput = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(EventType),
  startDate: z.date(),
  endDate: z.date(),
  budget: z.number(),
  headcount: z.number(),
  userEmail: z.string(),
  locationId: z.string(),
  decorNeeded: z.boolean(),
  menuNeeded: z.boolean(),
  performerNeeded: z.boolean(),
});

export type AddEventInput = z.TypeOf<typeof addEventInput>;
export type UpdateEventInput = z.TypeOf<typeof updateEventInput>;
