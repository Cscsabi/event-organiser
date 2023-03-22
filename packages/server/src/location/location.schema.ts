import { z } from "zod";
import { LocationType } from "@prisma/client";

export const addAddressInput = z.object({
  countryId: z.number(),
  country: z.object({
    id: z.number(),
  }),
  street: z.string(),
  city: z.string(),
  state: z.string().optional(),
  zipCode: z.number().optional(),
});

export const addLocationInput = z.object({
  userEmail: z.string(),
  name: z.string(),
  description: z.string().optional(),
  addressId: z.string(),
  address: addAddressInput,
  type: z.nativeEnum(LocationType),
  price: z.number().optional(),
  phone: z.string().optional(),
  link: z.string().optional(),
});

export const updateLocationInput = z.object({
  id: z.string(),
  userEmail: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  addressId: z.string().optional(),
  address: addAddressInput,
  type: z.nativeEnum(LocationType).optional(),
  price: z.number().optional(),
  phone: z.string().optional(),
  link: z.string().optional(),
});

export type AddLocationInput = z.TypeOf<typeof addLocationInput>;
export type AddAddressInput = z.TypeOf<typeof addAddressInput>;
export type UpdateLocationInput = z.TypeOf<typeof updateLocationInput>;
