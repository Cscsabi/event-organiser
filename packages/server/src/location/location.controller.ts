import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { AddLocationInput, UpdateLocationInput } from "./location.schema";
import { prisma } from "../app";
import { GetByEmailInput, ByIdInput } from "../general/general.schema";
import { Status } from "../status.enum";

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

    return {
      status: Status.SUCCESS,
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

export const updateLocationController = async ({
  updateLocationInput,
}: {
  updateLocationInput: UpdateLocationInput;
}) => {
  try {
    const location = await prisma.location.update({
      where: {
        id: updateLocationInput.id,
      },
      data: {
        name: updateLocationInput.name,
        address: {
          update: {
            city: updateLocationInput.address.city,
            street: updateLocationInput.address.street,
            state: updateLocationInput.address.state,
            zip_code: updateLocationInput.address.zipCode,
            country: {
              connect: {
                id: updateLocationInput.address.country.id,
              },
            },
          },
        },
        description: updateLocationInput.description,
        type: updateLocationInput.type,
        price: updateLocationInput.price,
        phone: updateLocationInput.phone,
        link: updateLocationInput.link,
      },
    });

    return {
      status: Status.SUCCESS,
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

export const deleteLocationController = async ({
  deleteLocationInput,
}: {
  deleteLocationInput: ByIdInput;
}) => {
  try {
    const location = await prisma.location.delete({
      where: {
        id: deleteLocationInput.id,
      },
    });

    return {
      status: Status.SUCCESS,
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
        userEmail: getByEmailInput.email,
      },
      include: {
        address: {
          select: {
            city: true,
          },
        },
      },
    });

    return {
      status: Status.SUCCESS,
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
  getByIdInput: ByIdInput;
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
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      location,
    };
  } catch (error) {
    throw error;
  }
};
