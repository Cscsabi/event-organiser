import {
  component$,
  Resource,
  useBrowserVisibleTask$,
  useResource$,
  useStore,
} from "@builder.io/qwik";
import type { ResourceReturn } from "@builder.io/qwik";
import { Status } from "event-organiser-api-server/src/status.enum";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import type {
  BudgetPlanningProps,
  BudgetPlanningStore,
  ContactsReturnType,
} from "~/utils/types";
import Toast from "../toast/toast";

export const BudgetPlanning = component$((props: BudgetPlanningProps) => {
  const EMPTY_ROW = {
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
      userEmail: "",
    },
  };

  const store = useStore<BudgetPlanningStore>({
    budgetPlanning: [],
    amountAltogether: 0,
    percentAltogether: 0,
    userEmail: "",
    modalContactId: "",
    modalOpen: false,
  });

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => props.budget);
    if (store.userEmail === "") {
      store.userEmail = (await getUser()).data.user?.email ?? "";
    }

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
              userEmail: row.contact.userEmail,
            },
          });
          store.amountAltogether += row?.amount ? +row.amount : 0;
        });
        if (props.active) {
          store.budgetPlanning = [...store.budgetPlanning, EMPTY_ROW];
        }
      }
    }

    store.percentAltogether = (store.amountAltogether / props.budget) * 100;
  });

  const contactsResource = useResource$<ContactsReturnType>(
    ({ track, cleanup }) => {
      track(() => store.userEmail);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getContacts.query({ email: store.userEmail });
    }
  );

  return (
    <div>
      <div
        class="relative overflow-x-auto shadow-md sm:rounded-lg"
        style={props.budget !== 0 ? "" : "display:none"}
      >
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr class="border-b border-neutral-700 bg-green-800 text-neutral-50 dark:border-neutral-600 dark:bg-indigo-400 dark:text-black">
              <th scope="col" class="px-6 py-4">
                Contact Name
              </th>
              <th scope="col" class="px-6 py-4">
                Amount
              </th>
              <th scope="col" class="px-6 py-4">
                %
              </th>
              <th scope="col" class="px-6 py-4">
                Description
              </th>
              <th scope="col" class="px-6 py-4">
                Paid
              </th>
            </tr>
          </thead>
          <tbody>
            {generateBudgetPlanningBody(store, props, contactsResource)}
            <tr class="font-semibold text-gray-900 dark:text-white dark:bg-slate-900">
              <td scope="row" class="px-6 py-3 text-base">
                Summary:
              </td>
              <td class="px-6 py-3">{store.amountAltogether}</td>
              <td class="px-6 py-3">{store.percentAltogether}</td>
              <td scope="row" class="px-6 py-3 text-base">
                Remaining:
              </td>
              <td class="px-6 py-3">{props.budget - store.amountAltogether}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
        type="button"
        hidden={!props.active}
        onClick$={() =>
          (store.budgetPlanning = [...store.budgetPlanning, EMPTY_ROW])
        }
      >
        Add Row
      </button>
      <button
        class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
        type="button"
        hidden={!props.active}
        onClick$={() => {
          saveRows(store);
          const toast = document.getElementById("successToast2");
          if (toast) {
            toast.classList.remove("hidden");
          }
        }}
      >
        Save
      </button>
      <Toast
        id="successToast2"
        text="Operation Successful!"
        type="success"
        position="bottom-right"
      ></Toast>
    </div>
  );
});

export const generateBudgetPlanningBody = async (
  store: BudgetPlanningStore,
  props: BudgetPlanningProps,
  resource: ResourceReturn<ContactsReturnType>
) => {
  return (
    <>
      {store.budgetPlanning.map((row) => {
        return (
          <tr class="bg-green-100 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-green-200 dark:hover:bg-gray-700">
            <td>
              <Resource
                value={resource}
                onPending={() => <div>Loading...</div>}
                onResolved={(result) => {
                  return (
                    <select
                      class="mx-6 my-4 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-10/12 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                            userEmail: selectedContact.contact.userEmail,
                          };
                          row.contact.name = store.contact.name;
                        }

                        row.description =
                          store.contact?.description + " " + row.description ??
                          row.description;

                        store.budgetPlanning = [...store.budgetPlanning];
                      }}
                    >
                      <option
                        value={row?.contactId ? row.contactId : ""}
                        selected
                        disabled
                        hidden
                      >
                        {row.contact.name ? row.contact.name : "Choose here"}
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
                class="w-full bg-gray-300 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
                }}
              ></input>
            </td>
            <td class="w-fit bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              <input
                class="w-full bg-gray-300 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                type="text"
                disabled
                value={((row.amount ?? 0) / props.budget) * 100}
              ></input>
            </td>
            <td>
              <input
                class="w-full bg-gray-300 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                type="text"
                disabled={!props.active ? true : row.isPaid}
                value={row.description}
                onChange$={(event) =>
                  (row.description = (event.target as HTMLInputElement).value)
                }
              ></input>
            </td>
            <td>
              <input
                class="mx-6 my-4 w-4 h-4 dark:text-blue-600 bg-gray-100 border-gray-300 rounded dark:focus:ring-blue-500 text-green-600 focus:ring-green-500 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                }}
              ></input>
            </td>
          </tr>
        );
      })}
    </>
  );
};

export const saveRows = async (store: BudgetPlanningStore) => {
  store.budgetPlanning
    .filter((row) => {
      return row.contactId != "";
    })
    .forEach(async (row) => {
      const result = await client.getBudgetPlanning.query({
        eventId: row.eventId,
        contactId: row.contactId,
      });
      const existingRow = result.budgetPlanning;
      if (result.status === Status.SUCCESS) {
        if (
          store.budgetPlanning.filter(
            (budgetPlanning) => budgetPlanning.contactId === row.contactId
          ).length === 1 &&
          (existingRow?.contactId.toLowerCase() !==
            row.contact.name.toLowerCase() ||
            (existingRow?.amount as unknown as number) !== row.amount ||
            existingRow?.isPaid !== row.isPaid)
        ) {
          client.updateBudgetPlanning.mutate({
            id: row.id,
            description: row.description,
            amount: row.amount,
            eventId: row.eventId,
            isPaid: row.isPaid,
            contactId: row.contactId,
          });
        } else {
          client.addBudgetPlanning.mutate({
            id: row.id,
            description: row.description ?? undefined,
            amount: row?.amount as unknown as number,
            eventId: row.eventId,
            isPaid: row.isPaid,
            contactId: row.contactId,
          });
        }
      } else {
        client.addBudgetPlanning.mutate({
          id: row.id,
          description: row.description ?? undefined,
          amount: row?.amount as unknown as number,
          eventId: row.eventId,
          isPaid: row.isPaid,
          contactId: row.contactId,
        });
      }
    });
};
