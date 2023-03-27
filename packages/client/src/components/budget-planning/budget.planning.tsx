import type { ResourceReturn } from "@builder.io/qwik";
import {
  component$,
  Resource,
  useContext,
  useResource$,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import { CTX } from "~/routes/[...lang]/layout";
import { client } from "~/utils/trpc";
import type {
  BudgetPlanningProps,
  BudgetPlanningRow,
  BudgetPlanningStore,
  BudgetPlanningType,
  ContactsReturnType,
} from "~/utils/types";

export const BudgetPlanning = component$((props: BudgetPlanningProps) => {
  const user = useContext(CTX);
  const EMPTY_ROW: BudgetPlanningRow = {
    id: 0,
    amount: 0,
    contactName: "",
    isPaid: false,
    eventId: props.eventId,
    description: "",
    contactId: "",
    contact: {
      id: "",
      name: "",
      phone: "",
      email: "",
      description: "",
      link: "",
      userEmail: "",
    },
  };
  const store = useStore<BudgetPlanningStore>({
    budgetPlanning: [],
    amountAltogether: 0,
    percentAltogether: 0,
    modalContactId: "",
    modalOpen: false,
    chooseHere: "",
    loading: "",
  });

  store.chooseHere = t("event.chooseHere@@Choose here");
  store.loading = t("common.loading@@Loading...");

  useVisibleTask$(async ({ track }) => {
    track(() => props.budget);

    if (store.budgetPlanning.length === 0) {
      const result = await client.getBudgetPlannings.query({
        id: props.eventId,
      });

      if (result.status === Status.SUCCESS) {
        result.budgetPlanning?.forEach((row) => {
          store.budgetPlanning.push({
            id: row.id,
            amount: row?.amount ? +row.amount : 0,
            isPaid: row.isPaid,
            eventId: row.eventId,
            contactId: row.contactId,
            description: row.description ?? undefined,
            contact: {
              description: row.contact.description,
              email: row.contact.email,
              id: row.contact.id,
              name: row.contact.name,
              phone: row.contact.phone,
              link: row.contact.link,
              userEmail: row.contact.userEmail,
            },
          });
          store.amountAltogether += row?.amount ? +row.amount : 0;
        });
        store.budgetPlanning = [...store.budgetPlanning, EMPTY_ROW];
      }
    }

    store.percentAltogether = (store.amountAltogether / props.budget) * 100;
  });

  const contactsResource = useResource$<ContactsReturnType>(
    ({ track, cleanup }) => {
      track(() => user.userEmail);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getContacts.query({ userEmail: user.userEmail ?? "" });
    }
  );

  return (
    <Speak assets={["budgetPlanning", "common"]}>
      <div
        class="relative overflow-x-auto shadow-md sm:rounded-lg"
        style={props.budget !== 0 ? "" : "display:none"}
      >
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 overflow-auto">
          <thead class="text-md bg-sky-700 text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
            <tr class="text-neutral-50 dark:bg-black text-center">
              <th scope="col" class="px-6 py-4">
                {t("budgetPlanning.contactName@@Contact Name")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("budgetPlanning.cost@@Cost")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("budgetPlanning.percent@@%")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("common.description@@Description")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("budgetPlanning.paid@@Paid")}
              </th>
            </tr>
          </thead>
          <tbody>
            {generateBudgetPlanningBody(
              store,
              props,
              contactsResource,
              EMPTY_ROW
            )}
            <tr class="text-base text-center bg-gray-300 text-gray-900 dark:text-white dark:bg-slate-900">
              <td scope="row" class="px-6 py-3 font-bold text-base">
                {t("budgetPlanning.summary@@Summary:")}
              </td>
              <td class="px-6 py-3">{store.amountAltogether}</td>
              <td class="px-6 py-3">{store.percentAltogether}</td>
              <td scope="row" class="px-6 py-3 font-bold text-base">
                {t("budgetPlanning.remaining@@Remaining:")}
              </td>
              <td class="px-6 py-3">{props.budget - store.amountAltogether}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Speak>
  );
});

export const generateBudgetPlanningBody = async (
  store: BudgetPlanningStore,
  props: BudgetPlanningProps,
  resource: ResourceReturn<ContactsReturnType>,
  EMPTY_ROW: BudgetPlanningRow
) => {
  return (
    <>
      {store.budgetPlanning.map((row) => {
        return (
          <tr class="bg-slate-50 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-center">
            <td>
              <Resource
                value={resource}
                onPending={() => <div>{store.loading}</div>}
                onResolved={(result) => {
                  return (
                    <select
                      class="text-center mx-6 my-4 bg-gray-300 border border-gray-500 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-slate-500 w-10/12 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-blue-600"
                      disabled={!props.active ? true : row.isPaid}
                      name="contact"
                      onChange$={async (event) => {
                        store.contactId = (
                          event.target as unknown as HTMLInputElement
                        ).value;
                        row.contactId = store.contactId;

                        const selectedContact = await client.getContact.query({
                          id: store.contactId,
                        });

                        if (selectedContact.contact) {
                          store.contact = {
                            description: selectedContact.contact.description,
                            email: selectedContact.contact.email,
                            id: selectedContact.contact.id,
                            name: selectedContact.contact.name,
                            phone: selectedContact.contact.phone,
                            link: row.contact.link,
                            userEmail: selectedContact.contact.userEmail,
                          };
                          row.contact.name = store.contact.name;
                        }

                        row.description = store.contact?.description ?? "";

                        store.budgetPlanning = [...store.budgetPlanning];
                        saveRow(row, store, EMPTY_ROW);
                      }}
                    >
                      <option
                        value={row?.contactId ? row.contactId : ""}
                        selected
                        disabled
                        hidden
                      >
                        {!props.active
                          ? ""
                          : row.contact.name
                          ? row.contact.name
                          : store.chooseHere}
                      </option>
                      {result.contacts?.map((contact) => {
                        return (
                          <option value={contact.id}>{contact.name}</option>
                        );
                      })}
                      ;
                    </select>
                  );
                }}
              />
            </td>
            <td>
              <input
                class="text-center ml-2 bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                disabled={!props.active ? true : row.isPaid}
                type="number"
                value={row.amount}
                onChange$={(event) => {
                  store.amountAltogether +=
                    +(event.target as HTMLInputElement).value -
                    (row.amount ?? 0);
                  store.percentAltogether =
                    (store.amountAltogether / props.budget) * 100;
                  row.amount = +(event.target as HTMLInputElement).value;
                  store.budgetPlanning = [...store.budgetPlanning];
                  saveRow(row, store, EMPTY_ROW);
                }}
              ></input>
            </td>
            <td class="w-fit bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              <input
                class="text-center ml-2 bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                type="text"
                disabled
                value={((row.amount ?? 0) / props.budget) * 100}
              ></input>
            </td>
            <td>
              <input
                class="text-center ml-2 bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                type="text"
                disabled={!props.active ? true : row.isPaid}
                value={row.description}
                onChange$={(event) => {
                  row.description = (event.target as HTMLInputElement).value;
                  saveRow(row, store, EMPTY_ROW);
                }}
              ></input>
            </td>
            <td>
              <input
                class="text-center mx-6 my-4 min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-sky-600 focus:ring-sky-700 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
                type="checkbox"
                checked={row.isPaid}
                disabled={
                  !props.active ||
                  row.contactId === "" ||
                  (row?.amount ? row.amount === 0 : true)
                }
                onChange$={(event) => {
                  row.isPaid = (event.target as HTMLInputElement).checked;
                  store.budgetPlanning = [...store.budgetPlanning];
                  saveRow(row, store, EMPTY_ROW);
                }}
              ></input>
            </td>
          </tr>
        );
      })}
    </>
  );
};

export const saveRow = async (
  budgetPlanningRow: BudgetPlanningType,
  store: BudgetPlanningStore,
  EMPTY_ROW: BudgetPlanningRow
) => {
  if (budgetPlanningRow.id !== 0) {
    client.updateBudgetPlanning.mutate({
      id: budgetPlanningRow.id,
      description: budgetPlanningRow.description,
      amount: budgetPlanningRow.amount,
      eventId: budgetPlanningRow.eventId,
      isPaid: budgetPlanningRow.isPaid,
      contactId: budgetPlanningRow.contactId,
    });
  } else {
    const newRow = await client.addBudgetPlanning.mutate({
      id: budgetPlanningRow.id,
      description: budgetPlanningRow.description ?? undefined,
      amount: budgetPlanningRow?.amount as unknown as number,
      eventId: budgetPlanningRow.eventId,
      isPaid: budgetPlanningRow.isPaid,
      contactId: budgetPlanningRow.contactId,
    });
    budgetPlanningRow.id = newRow.budgetPlanning?.id ?? 0;
    store.budgetPlanning = [...store.budgetPlanning, EMPTY_ROW];
  }
};
