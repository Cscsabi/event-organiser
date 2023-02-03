import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../app";
import { AddEventInput, AddLocationInput, GetByIdInput } from "./event.schema";

export const addEventController = async ({
  addEventInput,
}: {
  addEventInput: AddEventInput;
}) => {
  try {
    await prisma.event.create({
      data: {
        name: addEventInput.name,
        type: addEventInput.type,
        date: addEventInput.date,
        budget: addEventInput.budget,
        headcount: addEventInput.headcount,
        email: addEventInput.userEmail,
        locationId: addEventInput.locationId,
      },
    });

    return {
      status: "success",
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

export const addLocationController = async ({
  addLocationInput,
}: {
  addLocationInput: AddLocationInput;
}) => {
  try {
    await prisma.location.create({
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
      status: "success",
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

// TODO: Error handling
export const getCountriesController = async () => {
  try {
    const countries = await prisma.country.findMany();

    return {
      status: "success",
      results: countries.length,
      countries,
    };
  } catch (error) {
    throw error;
  }
};

export const getLocationsController = async () => {
  try {
    const locations = await prisma.location.findMany();

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

export const getEventsController = async () => {
  try {
    const events = await prisma.event.findMany();

    return {
      status: "success",
      results: events.length,
      events,
    };
  } catch (error) {
    throw error;
  }
};

export const getEventController = async ({
  getByIdInput,
}: {
  getByIdInput: GetByIdInput;
}) => {
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: getByIdInput.id,
      },
    });

    if (!event) {
      return {
        status: "NOT FOUND",
      };
    }

    return {
      status: "success",
      event,
    };
  } catch (error) {
    throw error;
  }
};
