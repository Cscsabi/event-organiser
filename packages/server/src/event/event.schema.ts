import { EventType } from "@prisma/client";
import { z } from "zod";

export const addEventInput = z.object({
  name: z.string(),
  type: z.nativeEnum(EventType),
  date: z.date(),
  budget: z.number(),
  headcount: z.number(),
  userEmail: z.string(),
  locationId: z.string(),
});

export type AddEventInput = z.TypeOf<typeof addEventInput>;

