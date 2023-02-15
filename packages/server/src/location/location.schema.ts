import { z } from "zod";

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

export const updateLocationInput = z.object({
  id: z.string(),
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

export type AddLocationInput = z.TypeOf<typeof addLocationInput>;
export type AddAddressInput = z.TypeOf<typeof addAddressInput>;
export type UpdateLocationInput = z.TypeOf<typeof updateLocationInput>;
