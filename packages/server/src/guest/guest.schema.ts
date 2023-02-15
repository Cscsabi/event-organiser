import { z } from "zod";

export const getGuestInput = z.object({
  guestId: z.string(),
});

export const guestEventInput = z.object({
  eventId: z.string(),
  guestId: z.string(),
});

export const addGuestInput = z.object({
  guestId: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  specialNeeds: z.string(),
  userEmail: z.string(),
});

export const addGuestAndConnectToEventInput = z.object({
  eventId: z.string(),
  guestId: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  specialNeeds: z.string(),
  userEmail: z.string(),
});


export const updateGuestInput = z.object({
  guestId: z.string(),
  userEmail: z.string(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  specialNeeds: z.string().optional(),
});

export const deleteGuestInput = z.object({
  guestId: z.string(),
});

export type GetGuestInput = z.TypeOf<typeof getGuestInput>;
export type AddGuestInput = z.TypeOf<typeof addGuestInput>;
export type AddGuestAndConnectToEventInput = z.TypeOf<typeof addGuestAndConnectToEventInput>;
export type UpdateGuestInput = z.TypeOf<typeof updateGuestInput>;
export type DeleteGuestInput = z.TypeOf<typeof deleteGuestInput>;
export type GuestEventInput = z.TypeOf<typeof guestEventInput>;
