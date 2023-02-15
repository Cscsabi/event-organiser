import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../app";
import { ByIdInput, GetByEmailInput } from "../general/general.schema";
import {
  AddGuestAndConnectToEventInput,
  AddGuestInput,
  DeleteGuestInput,
  GetGuestInput,
  GuestEventInput,
  UpdateGuestInput,
} from "./guest.schema";

export const getGuestsController = async ({
  getByEmailInput,
}: {
  getByEmailInput: GetByEmailInput;
}) => {
  try {
    const guests = await prisma.guest.findMany({
      where: {
        userEmail: getByEmailInput.email,
      },
    });

    return {
      status: "success",
      guests,
    };
  } catch (error) {
    throw error;
  }
};

export const getGuestController = async ({
  getGuestInput,
}: {
  getGuestInput: GetGuestInput;
}) => {
  try {
    const guest = await prisma.guest.findFirst({
      where: {
        id: getGuestInput.guestId,
      },
    });

    if (!guest) {
      return {
        status: "NOT FOUND",
      };
    }

    return {
      status: "success",
      guest,
    };
  } catch (error) {
    throw error;
  }
};

export const addGuestController = async ({
  addGuestInput,
}: {
  addGuestInput: AddGuestInput;
}) => {
  try {
    const guest = await prisma.guest.create({
      data: {
        email: addGuestInput.email,
        firstname: addGuestInput.firstname,
        lastname: addGuestInput.lastname,
        special_needs: addGuestInput.specialNeeds,
        userEmail: addGuestInput.userEmail,
      },
    });

    console.log(guest);

    return {
      status: "success",
      guest,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Guest already exists",
        });
      }
    }
    throw error;
  }
};

export const addGuestAndConnectToEventController = async ({
  addGuestAndConnectToEventInput,
}: {
  addGuestAndConnectToEventInput: AddGuestAndConnectToEventInput;
}) => {
  try {
    const guest = await prisma.guest.create({
      data: {
        email: addGuestAndConnectToEventInput.email,
        firstname: addGuestAndConnectToEventInput.firstname,
        lastname: addGuestAndConnectToEventInput.lastname,
        special_needs: addGuestAndConnectToEventInput.specialNeeds,
        userEmail: addGuestAndConnectToEventInput.userEmail,
        EventGuest: {
          create: {
            eventId: addGuestAndConnectToEventInput.eventId,
          },
        },
      },
    });

    console.log(guest);

    return {
      status: "success",
      guest,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Guest already exists",
        });
      }
    }
    throw error;
  }
};

export const updateGuestController = async ({
  updateGuestInput,
}: {
  updateGuestInput: UpdateGuestInput;
}) => {
  try {
    const guest = await prisma.guest.update({
      where: {
        id: updateGuestInput.guestId,
      },
      data: {
        email: updateGuestInput.email,
        firstname: updateGuestInput.firstname,
        lastname: updateGuestInput.lastname,
        special_needs: updateGuestInput.specialNeeds,
      },
    });

    return {
      status: "success",
      guest,
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

export const deleteGuestController = async ({
  deleteGuestInput,
}: {
  deleteGuestInput: DeleteGuestInput;
}) => {
  try {
    await prisma.guest.delete({
      where: {
        id: deleteGuestInput.guestId,
      },
      include: {
        EventGuest: {
          where: {
            guestId: deleteGuestInput.guestId,
          },
        },
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

export const deleteEventGuestController = async ({
  deleteEventGuestInput,
}: {
  deleteEventGuestInput: GuestEventInput;
}) => {
  try {
    await prisma.eventGuest.delete({
      where: {
        eventId_guestId: {
          eventId: deleteEventGuestInput.eventId,
          guestId: deleteEventGuestInput.guestId,
        },
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
