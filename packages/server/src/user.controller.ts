import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "./app";
import {
  CreateUserInput,
  FilterQueryInput,
  ParamsInput,
  UpdateUserInput,
  AddEventInput,
  AddLocationInput,
} from "./user.schema";

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
    const user = await prisma.user.findFirst({
      where: { email: paramsInput.email },
    });

    if (!user) {
      return {
        status: "NOT FOUND",
      };
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
