import { EventType } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string({
    required_error: "Email is required",
  }),
  firstname: z.string({
    required_error: "Firstname is required",
  }),
  lastname: z.string({
    required_error: "Lastname is required",
  }),
});

export const params = z.object({
  email: z.string(),
});

export const updateUserSchema = z.object({
  params,
  body: z
    .object({
      firstname: z.string(),
      lastname: z.string(),
      password: z.string(),
      email: z.string(),
      isactive: z.boolean(),
    })
    .partial(),
});

export const filterQuery = z.object({
  limit: z.number().default(1),
  page: z.number().default(10),
});

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
    id: z.number()
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

export type ParamsInput = z.TypeOf<typeof params>;
export type FilterQueryInput = z.TypeOf<typeof filterQuery>;
export type CreateUserInput = z.TypeOf<typeof createUserSchema>;
export type UpdateUserInput = z.TypeOf<typeof updateUserSchema>;
export type AddEventInput = z.TypeOf<typeof addEventInput>;
export type AddLocationInput = z.TypeOf<typeof addLocationInput>;
export type AddAddressInput = z.TypeOf<typeof addAddressInput>;
