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

export const addAddressInput = z.object({
  countryId: z.number(),
  country: z.object({
    id: z.number(),
  }),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.number(),
});

export const addLocationInput = z.object({
  userEmail: z.string(),
  name: z.string(),
  description: z.string(),
  addressId: z.string(),
  address: addAddressInput,
  type: z.string(),
  price: z.number(),
  phone: z.string(),
  link: z.string(),
});

export const getByIdInput = z.object({
  id: z.string(),
});

export type AddEventInput = z.TypeOf<typeof addEventInput>;
export type AddLocationInput = z.TypeOf<typeof addLocationInput>;
export type AddAddressInput = z.TypeOf<typeof addAddressInput>;
export type GetByIdInput = z.TypeOf<typeof getByIdInput>;
