import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "./app";
import {
  CreateUserInput,
  FilterQueryInput,
  ParamsInput,
  UpdateUserInput,
} from "./user.schema";

export const createUserController = async ({
  input,
}: {
  input: CreateUserInput;
}) => {
  try {
    console.log(typeof input.birthday);
    const user = await prisma.user.create({
      data: {
        firstname: input.firstname,
        lastname: input.lastname,
        email: input.email,
        password: input.password,
        birthday: input.birthday,
        gender: input.gender,
        isactive: input.isactive,
      },
    });

    console.log(user);

    return {
      status: "success",
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
      status: "success",
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
    console.log("IIIIIIII");
    const user = await prisma.user.findFirst({
      where: { email: paramsInput.email },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User with that email not found",
      });
    }

    return {
      status: "success",
      user,
    };
  } catch (error) {
    console.log(error);
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
      status: "success",
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
    console.log(paramsInput.email);
    await prisma.user.delete({ where: { email: paramsInput.email } });

    return {
      status: "success",
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
