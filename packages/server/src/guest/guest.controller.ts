import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../app";
import { GetByEmailInput } from "../general/general.schema";
import { Status } from "../status.enum";
import {
  AddGuestAndConnectToEventInput,
  AddGuestInput,
  connectGuestToEventInput,
  ConnectGuestToEventInput,
  DeleteGuestInput,
  GetGuestByEmails,
  GetGuestInput,
  GetGuestsInput,
  GuestEventInput,
  UpdateGuestInput,
} from "./guest.schema";

export const getGuestsController = async ({
  getGuestsInput,
}: {
  getGuestsInput: GetGuestsInput;
}) => {
  try {
    let guests;
    if (getGuestsInput.filteredByEvent) {
      // Selecting guests that are assigned to the event
      guests = await prisma.guest.findMany({
        where: {
          userEmail: getGuestsInput.userEmail,
          eventGuest: {
            some: {
              eventId: getGuestsInput.eventId,
            },
          },
        },
      });
    } else if (getGuestsInput.connectingOnly) {
      // Selecting existing guests, that are not assigned to the event
      guests = await prisma.guest.findMany({
        where: {
          userEmail: getGuestsInput.userEmail,
          eventGuest: {
            none: {
              eventId: getGuestsInput.eventId,
            },
          },
        },
      });
    } else {
      // Selecting all guests
      guests = await prisma.guest.findMany({
        where: {
          userEmail: getGuestsInput.userEmail,
        },
      });
    }

    return {
      status: Status.SUCCESS,
      guests,
    };
  } catch (error) {
    console.error("Invalid input!");
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
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      guest,
    };
  } catch (error) {
    console.error("Invalid input!");
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
        description: addGuestInput.description,
        userEmail: addGuestInput.userEmail,
      },
    });

    console.log(guest);

    return {
      status: Status.SUCCESS,
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
        description: addGuestAndConnectToEventInput.description,
        userEmail: addGuestAndConnectToEventInput.userEmail,
        eventGuest: {
          create: {
            eventId: addGuestAndConnectToEventInput.eventId,
          },
        },
      },
    });

    console.log(guest);

    return {
      status: Status.SUCCESS,
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

export const connectGuestToEventController = async ({
  connectGuestToEventInput,
}: {
  connectGuestToEventInput: ConnectGuestToEventInput;
}) => {
  try {
    const guest = await prisma.eventGuest.create({
      data: {
        eventId: connectGuestToEventInput.eventId,
        guestId: connectGuestToEventInput.guestId,
      },
    });

    console.log(guest);

    return {
      status: Status.SUCCESS,
      guest,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Guest is already assigned to this event.",
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
        description: updateGuestInput.description,
      },
    });

    return {
      status: Status.SUCCESS,
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
        eventGuest: {
          where: {
            guestId: deleteGuestInput.guestId,
          },
        },
      },
    });

    return {
      status: Status.SUCCESS,
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
      status: Status.SUCCESS,
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

export const getEventGuestController = async ({
  getEventGuestInput,
}: {
  getEventGuestInput: ConnectGuestToEventInput;
}) => {
  try {
    const eventGuest = await prisma.eventGuest.findFirst({
      where: {
        eventId: getEventGuestInput.eventId,
        guestId: getEventGuestInput.guestId,
      },
    });

    if (!eventGuest) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return { status: Status.SUCCESS };
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

export const getGuestByEmailController = async ({
  getGuestByEmailsInput,
}: {
  getGuestByEmailsInput: GetGuestByEmails;
}) => {
  try {
    const guestId = await prisma.guest.findFirst({
      where: {
        email: getGuestByEmailsInput.guestEmail,
        userEmail: getGuestByEmailsInput.userEmail,
      },
      select: {
        id: true,
      },
    });

    if (!guestId) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return { status: Status.SUCCESS, guestId };
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
