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
  ContactCard,
  ContactsReturnType,
} from "~/utils/types";
import { QwikModal } from "~/integrations/react/modal";

export const BudgetPlanning = component$((props: BudgetPlanningProps) => {
  const EMPTY_ROW = {
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

  const contactCard = useResource$<ContactCard>(({ track, cleanup }) => {
    track(() => store.modalContactId);
    const controller = new AbortController();
    cleanup(() => controller.abort());
    return client.getContact.query({ id: store.modalContactId });
  });

  return (
    <div>
      <div
        class="relative overflow-x-auto shadow-md sm:rounded-lg"
        style={props.budget !== 0 ? "" : "display:none"}
      >
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr class="border-b border-neutral-700 bg-violet-900 text-neutral-50 dark:border-neutral-600 dark:bg-neutral-700">
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
              <th scope="col" class="px-6 py-4"></th>
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
              <td class="px-6 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
        <QwikModal
          client:hover
          // @ts-ignore: Type is not assignable to type
          isOpen={store.modalOpen}
          className="bg-slate-300 dark:bg-gray-600 overflow-hidden absolute inset-10 rounded-2xl p-6"
          >
          <button
            class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick$={() => (store.modalOpen = false)}
          >
            Close
          </button>
          <Resource
            value={contactCard}
            onPending={() => <div>Loading...</div>}
            onResolved={(result) => {
              return (
                <div>
                  <label for="name">Name:</label>
                  <input
                    readOnly={!props.active}
                    type="text"
                    value={result.contact?.name}
                  ></input>
                  <label for="description">Description:</label>
                  <input
                    type="text"
                    readOnly={!props.active}
                    value={result.contact?.description}
                  ></input>
                  <label for="phone">Phone:</label>
                  <input
                    type="text"
                    readOnly={!props.active}
                    value={result.contact?.phone}
                  ></input>
                  <label for="email">E-mail:</label>
                  <input
                    type="text"
                    readOnly={!props.active}
                    value={result.contact?.email}
                  ></input>
                </div>
              );
            }}
          />
        </QwikModal>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        type="button"
        hidden={!props.active}
        onClick$={() =>
          (store.budgetPlanning = [...store.budgetPlanning, EMPTY_ROW])
        }
      >
        Add Row
      </button>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        type="button"
        hidden={!props.active}
        onClick$={() => saveRows(store)}
      >
        Save
      </button>
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
          <tr class="border-b dark:bg-gray-800 bg-slate-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td>
              <Resource
                value={resource}
                onPending={() => <div>Loading...</div>}
                onResolved={(result) => {
                  return (
                    <select
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                        console.log(store.contact?.description);
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
                class="w-full bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                disabled={!props.active ? true : row.isPaid}
                type="number"
                value={row.amount}
                onChange$={(event) => {
                  console.log(store.budgetPlanning);

                  store.amountAltogether +=
                    +(event.target as HTMLInputElement).value -
                    (row.amount ?? 0);
                  store.percentAltogether =
                    (store.amountAltogether / props.budget) * 100;
                  row.amount = +(event.target as HTMLInputElement).value;
                  console.log(row);
                  console.log(store.budgetPlanning);
                  store.budgetPlanning = [...store.budgetPlanning];
                }}
              ></input>
            </td>
            <td>
              <input
                class="w-full bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                type="number"
                readOnly
                disabled={!props.active ? true : row.isPaid}
                value={((row.amount ?? 0) / props.budget) * 100}
              ></input>
            </td>
            <td>
              <input
                class="w-full bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
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
                class="w-full bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                type="checkbox"
                checked={row.isPaid}
                disabled={!props.active}
                onChange$={(event) => {
                  row.isPaid = (event.target as HTMLInputElement).checked;
                  store.budgetPlanning = [...store.budgetPlanning];
                }}
              ></input>
            </td>
            <td>
              <button
                class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                disabled={row.contact.name === ""}
                onClick$={() => {
                  store.modalOpen = true;
                  store.modalContactId = row.contactId;
                }}
              >
                Contact Card
              </button>
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
      console.log(row);
      return row.contactId != "";
    })
    .forEach(async (row) => {
      console.log(row);
      const result = await client.getBudgetPlanning.query({
        eventId: row.eventId,
        contactId: row.contactId,
      });
      console.log(result.status);
      const existingRow = result.budgetPlanning;
      console.log(existingRow?.isPaid);
      if (result.status === Status.SUCCESS) {
        if (
          existingRow?.contactId.toLowerCase() !==
            row.contact.name.toLowerCase() ||
          (existingRow?.amount as unknown as number) !== row.amount ||
          existingRow?.isPaid !== row.isPaid
        ) {
          await client.updateBudgetPlanning.mutate({
            description: row.description,
            amount: row.amount,
            eventId: row.eventId,
            isPaid: row.isPaid,
            contactId: row.contactId,
          });
        }
      } else {
        await client.addBudgetPlanning.mutate({
          description: row.description ?? undefined,
          amount: row?.amount as unknown as number,
          eventId: row.eventId,
          isPaid: row.isPaid,
          contactId: row.contactId,
        });
      }
    });
};
