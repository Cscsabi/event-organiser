import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../app";
import { ByIdInput } from "../general/general.schema";
import { Status } from "../status.enum";
import { AddFeedbackInput, GetFeedbackInput } from "./feedback.schema";

export const getFeedbackController = async ({
  getFeedbackInput,
}: {
  getFeedbackInput: GetFeedbackInput;
}) => {
  try {
    const feedback = await prisma.feedback.findFirst({
      where: {
        eventId: getFeedbackInput.eventId,
        guestEmail: getFeedbackInput.guestEmail,
      },
    });

    if (!feedback) {
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

export const getFeedbacksController = async ({
  getFeedbacksInput,
}: {
  getFeedbacksInput: ByIdInput;
}) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        eventId: getFeedbacksInput.id,
      },
    });

    return {
      status: Status.SUCCESS,
      feedbacks,
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

export const addFeedbackController = async ({
  addFeedbackInput,
}: {
  addFeedbackInput: AddFeedbackInput;
}) => {
  try {
    const feedback = await prisma.feedback.create({
      data: {
        eventId: addFeedbackInput.eventId,
        guestEmail: addFeedbackInput.guestEmail,
        diabetes: addFeedbackInput.diabetes,
        firstname: addFeedbackInput.firstname,
        gluten: addFeedbackInput.gluten,
        lactose: addFeedbackInput.lactose,
        lastname: addFeedbackInput.lastname,
        plusOne: addFeedbackInput.plusOne,
        additional: addFeedbackInput.additional,
      },
    });

    if (!feedback) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return { status: Status.SUCCESS, feedback };
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
