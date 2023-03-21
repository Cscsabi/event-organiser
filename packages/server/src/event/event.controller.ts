import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../app";
import { ByIdInput, GetByEmailInput } from "../general/general.schema";
import { AddEventInput, UpdateEventInput } from "./event.schema";
import { Status } from "../status.enum";

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
        startDate: addEventInput.startDate,
        endDate: addEventInput.endDate,
        budget: addEventInput.budget,
        headcount: addEventInput.headcount,
        userEmail: addEventInput.userEmail,
        locationId: addEventInput.locationId,
      },
    });

    return {
      status: Status.SUCCESS,
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

export const updateEventController = async ({
  updateEventInput,
}: {
  updateEventInput: UpdateEventInput;
}) => {
  try {
    const event = await prisma.event.update({
      where: {
        id: updateEventInput.id,
      },
      data: {
        name: updateEventInput.name,
        type: updateEventInput.type,
        startDate: updateEventInput.startDate,
        endDate: updateEventInput.endDate,
        budget: updateEventInput.budget,
        headcount: updateEventInput.headcount,
        locationId: updateEventInput.locationId,
        userEmail: updateEventInput.userEmail,
      },
    });

    return {
      status: Status.SUCCESS,
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

export const deleteEventController = async ({
  deleteInput,
}: {
  deleteInput: ByIdInput;
}) => {
  try {
    const event = await prisma.event.delete({
      where: {
        id: deleteInput.id,
      },
    });

    return {
      status: Status.SUCCESS,
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
      status: Status.SUCCESS,
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
        userEmail: getByEmailInput.email,
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
      status: Status.SUCCESS,
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
  getByIdInput: ByIdInput;
}) => {
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: getByIdInput.id,
      },
      include: {
        location: {
          include: {
            address: true,
          },
        },
      },
    });

    if (!event) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      event,
    };
  } catch (error) {
    throw error;
  }
};

export const getFeedbackEventsController = async () => {
  try {
    const events = await prisma.event.findMany({
      select: { id: true },
    });

    if (!events) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      events,
    };
  } catch (error) {
    throw error;
  }
};
