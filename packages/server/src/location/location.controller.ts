import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { AddLocationInput } from "./location.schema";
import { prisma } from "../app";
import { GetByEmailInput, GetByIdInput } from "../general/general.schema";

export const addLocationController = async ({
  addLocationInput,
}: {
  addLocationInput: AddLocationInput;
}) => {
  try {
    const location = await prisma.location.create({
      data: {
        user: {
          connect: { email: addLocationInput.userEmail },
        },
        name: addLocationInput.name,
        address: {
          create: {
            city: addLocationInput.address.city,
            street: addLocationInput.address.street,
            state: addLocationInput.address.state,
            zip_code: addLocationInput.address.zipCode,
            country: {
              connect: {
                id: addLocationInput.address.country.id,
              },
            },
          },
        },
        description: addLocationInput.description,
        type: addLocationInput.type,
        price: addLocationInput.price,
        phone: addLocationInput.phone,
        link: addLocationInput.link,
      },
    });

    console.log(location);

    return {
      status: "success",
      location,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
        });
      }
    }
    throw error;
  }
};

export const getLocationsController = async ({
  getByEmailInput,
}: {
  getByEmailInput: GetByEmailInput;
}) => {
  try {
    const locations = await prisma.location.findMany({
      where: {
        email: getByEmailInput.email,
      },
    });

    return {
      status: "success",
      results: locations.length,
      locations,
    };
  } catch (error) {
    throw error;
  }
};

export const getLocationController = async ({
  getByIdInput,
}: {
  getByIdInput: GetByIdInput;
}) => {
  try {
    const location = await prisma.location.findFirst({
      where: {
        id: getByIdInput.id,
      },
      include: {
        address: true,
      },
    });

    if (!location) {
      return {
        status: "NOT FOUND",
      };
    }

    return {
      status: "success",
      location,
    };
  } catch (error) {
    throw error;
  }
};
