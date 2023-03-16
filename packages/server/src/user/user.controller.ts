import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../app";
import {
  CreateUserInput,
  FilterQueryInput,
  ParamsInput,
  SendEmailInput,
  UpdateUserInput,
} from "./user.schema";
import { Status } from "../status.enum";
import { Client, SendEmailV3_1 } from "node-mailjet";

export const createUserController = async ({
  input,
}: {
  input: CreateUserInput;
}) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        firstname: input.firstname,
        lastname: input.lastname,
        darkModeEnabled: false,
      },
    });

    return {
      status: Status.SUCCESS,
      data: {
        user,
      },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with that email already exists",
        });
      }
    }
    throw error;
  }
};

export const updateUserController = async ({
  paramsInput,
  input,
}: {
  paramsInput: ParamsInput;
  input: UpdateUserInput["body"];
}) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: paramsInput.email },
      data: input,
    });

    return {
      status: Status.SUCCESS,
      user: updatedUser,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with that email already exists",
        });
      }
    }
    throw error;
  }
};

export const findUserController = async ({
  paramsInput,
}: {
  paramsInput: ParamsInput;
}) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: paramsInput.email },
    });

    if (!user) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      user,
    };
  } catch (error) {
    throw error;
  }
};

export const findAllUsersController = async ({
  filterQuery,
}: {
  filterQuery: FilterQueryInput;
}) => {
  try {
    const page = filterQuery.page || 1;
    const limit = filterQuery.limit || 10;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({ skip, take: limit });

    return {
      status: Status.SUCCESS,
      results: users.length,
      users,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteUserController = async ({
  paramsInput,
}: {
  paramsInput: ParamsInput;
}) => {
  try {
    await prisma.user.delete({ where: { email: paramsInput.email } });

    return {
      status: Status.SUCCESS,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User with that email not found",
        });
      }
    }
    throw error;
  }
};

const mailjet = new Client({
  apiKey: process.env.MJ_API_KEY,
  apiSecret: process.env.MJ_API_SECRET,
});

export async function sendEmailController({
  sendEmailInput,
}: {
  sendEmailInput: SendEmailInput;
}) {
  const data: SendEmailV3_1.Body = {
    Messages: [
      {
        From: {
          Email: process.env.MJ_SENDER_EMAIL ?? "",
          Name: "Event Organiser Team",
        },
        To: [
          {
            Email: sendEmailInput.email,
            Name: sendEmailInput.name,
          },
        ],
        Subject: sendEmailInput.subject,
        TextPart: sendEmailInput.text,
        HTMLPart: sendEmailInput.html,
      },
    ],
  };

  return mailjet
    .post("send", { version: "v3.1" })
    .request(data);
}
