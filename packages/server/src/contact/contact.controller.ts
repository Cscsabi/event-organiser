import { prisma } from "../app";
import { ByIdInput, ByNoInput } from "../general/general.schema";
import { Status } from "../status.enum";
import {
  BudgetPlanningInput,
  ContactInput,
  GetBudgetPlanningInput,
  GetContactsInput,
  UpdateContactInput,
} from "./contact.schema";

export const getBudgetPlanningController = async ({
  getBudgetPlanningInput,
}: {
  getBudgetPlanningInput: GetBudgetPlanningInput;
}) => {
  try {
    const budgetPlanning = await prisma.budgetPlanning.findFirst({
      where: {
        eventId: getBudgetPlanningInput.eventId,
        contactId: getBudgetPlanningInput.contactId,
      },
      include: {
        contact: true,
      },
    });

    if (!budgetPlanning) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      budgetPlanning,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};

export const getBudgetPlanningByIdController = async ({
  getBudgetPlanningInput,
}: {
  getBudgetPlanningInput: ByNoInput;
}) => {
  try {
    const budgetPlanning = await prisma.budgetPlanning.findFirst({
      where: {
        id: getBudgetPlanningInput.id,
      },
      include: {
        contact: true,
      },
    });

    if (!budgetPlanning) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      budgetPlanning,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};

export const getBudgetPlanningsController = async ({
  getByIdInput,
}: {
  getByIdInput: ByIdInput;
}) => {
  try {
    const budgetPlanning = await prisma.budgetPlanning.findMany({
      where: {
        eventId: getByIdInput.id,
      },
      include: {
        contact: true,
      },
    });

    if (!budgetPlanning) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      budgetPlanning,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};

export const addBudgetPlanningController = async ({
  budgetPlanningInput,
}: {
  budgetPlanningInput: BudgetPlanningInput;
}) => {
  try {
    const budgetPlanning = await prisma.budgetPlanning.create({
      data: {
        description: budgetPlanningInput.description,
        eventId: budgetPlanningInput.eventId,
        amount: budgetPlanningInput.amount,
        isPaid: budgetPlanningInput.isPaid,
        contactId: budgetPlanningInput.contactId,
      },
    });

    return {
      status: Status.SUCCESS,
      budgetPlanning,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};

export const updateBudgetPlanningController = async ({
  budgetPlanningInput,
}: {
  budgetPlanningInput: BudgetPlanningInput;
}) => {
  try {
    const budgetPlanning = await prisma.budgetPlanning.update({
      where: {
        id: budgetPlanningInput.id,
      },
      data: {
        contactId: budgetPlanningInput.contactId,
        amount: budgetPlanningInput.amount,
        isPaid: budgetPlanningInput.isPaid,
      },
    });

    if (!budgetPlanning) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      budgetPlanning,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};

export const deleteBudgetPlanningController = async ({
  deleteBudgetPlanningInput,
}: {
  deleteBudgetPlanningInput: ByNoInput;
}) => {
  try {
    await prisma.budgetPlanning.delete({
      where: {
        id: deleteBudgetPlanningInput.id,
      },
    });

    return {
      status: Status.SUCCESS,
    };
  } catch (error) {
    return Status.FAILED;
  }
};

export const getContactController = async ({
  byIdInput,
}: {
  byIdInput: ByIdInput;
}) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id: byIdInput.id,
      },
    });

    if (!contact) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      contact,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};

export const getContactsPaginationController = async ({
  getContactsInput,
}: {
  getContactsInput: GetContactsInput;
}) => {
  try {
    const contacts = await prisma.contact.findMany({
      skip: getContactsInput.skip,
      take: getContactsInput.take,
      orderBy: { id: "asc" },
      ...(getContactsInput.cursor === undefined
        ? {}
        : { cursor: { id: getContactsInput.cursor } }),
      where: {
        userEmail: getContactsInput.userEmail,
        OR: [
          {
            name: {
              contains: getContactsInput.filter,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: getContactsInput.filter,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: getContactsInput.filter,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: getContactsInput.filter,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    console.log(getContactsInput);

    if (!contacts) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      contacts,
    };
  } catch (error) {
    console.log(error);
    return { status: Status.FAILED };
  }
};

export const getContactsController = async ({
  getContactsInput,
}: {
  getContactsInput: GetContactsInput;
}) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { id: "asc" },
      where: {
        userEmail: getContactsInput.userEmail,
      },
    });

    console.log(getContactsInput);

    if (!contacts) {
      return {
        status: Status.NOT_FOUND,
      };
    }

    return {
      status: Status.SUCCESS,
      contacts,
    };
  } catch (error) {
    console.log(error);
    return { status: Status.FAILED };
  }
};

export const addContactController = async ({
  contactInput,
}: {
  contactInput: ContactInput;
}) => {
  try {
    const contact = await prisma.contact.create({
      data: {
        name: contactInput.name,
        phone: contactInput.phone,
        email: contactInput.email,
        description: contactInput.description,
        link: contactInput.link,
        userEmail: contactInput.userEmail,
      },
    });

    return {
      status: Status.SUCCESS,
      contact,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};

export const updateContactController = async ({
  updateContactInput,
}: {
  updateContactInput: UpdateContactInput;
}) => {
  try {
    console.log(updateContactInput);

    const contact = await prisma.contact.update({
      data: {
        name: updateContactInput.name,
        phone: updateContactInput.phone,
        email: updateContactInput.email,
        link: updateContactInput.link,
        userEmail: updateContactInput.userEmail,
      },
      where: {
        id: updateContactInput.id,
      },
    });
    console.log(contact);

    return {
      status: Status.SUCCESS,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};

export const deleteContactController = async ({
  byIdInput,
}: {
  byIdInput: ByIdInput;
}) => {
  try {
    await prisma.contact.delete({
      where: {
        id: byIdInput.id,
      },
    });

    return {
      status: Status.SUCCESS,
    };
  } catch (error) {
    return { status: Status.FAILED };
  }
};
