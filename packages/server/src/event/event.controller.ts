import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../app";
import { GetByEmailInput, GetByIdInput } from "../general/general.schema";
import { AddEventInput } from "./event.schema";

export const addEventController = async ({
  addEventInput,
}: {
  addEventInput: AddEventInput;
}) => {
  try {
    const event = await prisma.event.create({
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

    console.log(event);

    return {
      status: "success",
      event: event,
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

export const getEventsController = async ({
  getByEmailInput,
}: {
  getByEmailInput: GetByEmailInput;
}) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        email: getByEmailInput.email,
      },
      include: {
        location: {
          select: {
            name: true,
          },
        },
      },
    });

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
