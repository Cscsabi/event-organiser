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
        class="table-wrapper"
        style={props.budget !== 0 ? "" : "display:none"}
      >
        Budget Planning:
        <table class="fl-table">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Amount</th>
              <th>%</th>
              <th>Description</th>
              <th>Paid</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {generateBudgetPlanningBody(store, props, contactsResource)}
            <tr>
              <td>Summary:</td>
              <td>{store.amountAltogether}</td>
              <td>{store.percentAltogether}</td>
              <td>Remaining:</td>
              <td>{props.budget - store.amountAltogether}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <QwikModal
        client:hover
        // @ts-ignore: Type is not assignable to type
        isOpen={store.modalOpen}
        ariaHideApp={false}
      >
        <button onClick$={() => (store.modalOpen = false)}>Close</button>
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
                ></input>{" "}
                <label for="description">Description:</label>
                <input
                  type="text"
                  readOnly={!props.active}
                  value={result.contact?.description}
                ></input>{" "}
                <label for="phone">Phone:</label>
                <input
                  type="text"
                  readOnly={!props.active}
                  value={result.contact?.phone}
                ></input>{" "}
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
        hidden={!props.active}
        onClick$={() =>
          (store.budgetPlanning = [...store.budgetPlanning, EMPTY_ROW])
        }
      >
        Add Row
      </button>
      <button hidden={!props.active} onClick$={() => saveRows(store)}>
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
          <tr>
            <td>
              <Resource
                value={resource}
                onPending={() => <div>Loading...</div>}
                onResolved={(result) => {
                  return (
                    <select
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
                type="number"
                readOnly
                disabled={!props.active ? true : row.isPaid}
                value={((row.amount ?? 0) / props.budget) * 100}
              ></input>
            </td>
            <td>
              <input
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
          window.location.reload();
        }
      } else {
        await client.addBudgetPlanning.mutate({
          description: row.description ?? undefined,
          amount: row?.amount as unknown as number,
          eventId: row.eventId,
          isPaid: row.isPaid,
          contactId: row.contactId,
        });
        window.location.reload();
      }
    });
};
