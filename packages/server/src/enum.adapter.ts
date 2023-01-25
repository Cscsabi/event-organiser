import { Gender as PrismaGender } from "@prisma/client";

export const Gender = {
  FEMALE: PrismaGender.FEMALE,
  MALE: PrismaGender.MALE,
  CUSTOM: PrismaGender.CUSTOM,
} as const;

export type Gender = typeof Gender[keyof typeof Gender];
