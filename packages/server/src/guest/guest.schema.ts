import { z } from "zod";

export const getGuestInput = z.object({
  guestId: z.string(),
});

export const guestEventInput = z.object({
  eventId: z.string(),
  guestId: z.string(),
});

export const addGuestInput = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
  userEmail: z.string(),
});

export const addGuestAndConnectToEventInput = z.object({
  eventId: z.string(),
  guestId: z.string(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
  userEmail: z.string(),
});

export const updateGuestInput = z.object({
  guestId: z.string(),
  userEmail: z.string(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
});

export const deleteGuestInput = z.object({
  guestId: z.string(),
});

export const getGuestsInput = z.object({
  userEmail: z.string(),
  filteredByEvent: z.boolean().optional(),
  eventId: z.string().optional(),
  skip: z.number().optional(),
  cursor: z.string().optional(),
  take: z.number().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
  filter: z.string().optional(),
});

export const connectGuestToEventInput = z.object({
  guestId: z.string(),
  eventId: z.string(),
});

export const getGuestByEmails = z.object({
  userEmail: z.string(),
  guestEmail: z.string(),
});

export type GetGuestInput = z.TypeOf<typeof getGuestInput>;
export type AddGuestInput = z.TypeOf<typeof addGuestInput>;
export type AddGuestAndConnectToEventInput = z.TypeOf<
  typeof addGuestAndConnectToEventInput
>;
export type UpdateGuestInput = z.TypeOf<typeof updateGuestInput>;
export type DeleteGuestInput = z.TypeOf<typeof deleteGuestInput>;
export type GuestEventInput = z.TypeOf<typeof guestEventInput>;
export type GetGuestsInput = z.TypeOf<typeof getGuestsInput>;
export type ConnectGuestToEventInput = z.TypeOf<
  typeof connectGuestToEventInput
>;
export type GetGuestByEmails = z.TypeOf<typeof getGuestByEmails>;
