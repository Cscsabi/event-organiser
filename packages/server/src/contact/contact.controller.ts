import { prisma } from "../app";
import { ByIdInput, ByNoInput, GetByEmailInput } from "../general/general.schema";
import { Status } from "../status.enum";
import {
  BudgetPlanningInput,
  ContactInput,
  GetBudgetPlanningInput,
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

export const getContactsController = async ({
  getByEmailInput,
}: {
  getByEmailInput: GetByEmailInput;
}) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        userEmail: getByEmailInput.email,
      },
    });

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
    await prisma.contact.update({
      data: {
        name: updateContactInput.name,
        phone: updateContactInput.phone,
        email: updateContactInput.email,
        userEmail: updateContactInput.userEmail,
      },
      where: {
        id: updateContactInput.id,
      },
    });

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
