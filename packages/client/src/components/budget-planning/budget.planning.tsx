import {
  component$,
  Resource,
  useClientEffect$,
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
import { paths } from "~/utils/paths";
import { useNavigate } from "@builder.io/qwik-city";

export const BudgetPlanning = component$((props: BudgetPlanningProps) => {
  const EMPTY_ROW = {
    amount: 0,
    contactName: "",
    isPaid: false,
    eventId: props.eventId,
    description: "",
    contactId: "",
  };

  const store = useStore<BudgetPlanningStore>({
    budgetPlanning: [],
    amountAltogether: 0,
    percentAltogether: 0,
    userEmail: "",
  });

  const navigate = useNavigate();

  useClientEffect$(async () => {
    store.userEmail = (await getUser()).data.user?.email ?? "";
    const result = await client.getBudgetPlannings.query({
      id: props.eventId,
    });

    if (result.status === Status.SUCCESS) {
      result.budgetPlanning?.forEach((row) => {
        store.budgetPlanning.push({
          amount: +row.amount,
          contactName: row.contactName,
          isPaid: row.isPaid,
          eventId: row.eventId,
          contactId: row.contactId,
          description: row.description,
        });
        store.amountAltogether += +row.amount;
      });
    }

    store.budgetPlanning = [...store.budgetPlanning, EMPTY_ROW];
    console.log(props.budget);
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
      <button
        onClick$={() =>
          (store.budgetPlanning = [...store.budgetPlanning, EMPTY_ROW])
        }
      >
        Add Row
      </button>
      <button onClick$={() => saveRows(store)}>Save</button>
      <button onClick$={() => (navigate.path = paths.newContact)}>
        Add Contact
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
                      disabled={row.isPaid}
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
                          row.contactName = store.contact.name;
                        }
                        console.log(store.contact?.description);
                        row.description =
                          store.contact?.description + ", " + row.description ??
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
                        {row.contactName ? row.contactName : "Choose here"}
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
                disabled={row.isPaid}
                type="number"
                value={row.amount}
                onChange$={(event) => {
                  console.log(store.budgetPlanning);

                  store.amountAltogether +=
                    +(event.target as HTMLInputElement).value - row.amount;
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
                disabled={row.isPaid}
                value={(row.amount / props.budget) * 100}
              ></input>
            </td>
            <td>
              <input
                type="text"
                disabled={row.isPaid}
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
            row.contactName.toLowerCase() ||
          +existingRow?.amount !== row.amount ||
          existingRow?.isPaid !== row.isPaid
        ) {
          await client.updateBudgetPlanning.mutate({
            description: row.description,
            amount: row.amount,
            eventId: row.eventId,
            contactName: row.contactName,
            isPaid: row.isPaid,
            contactId: row.contactId,
          });
          window.location.reload();
        }
      } else {
        await client.addBudgetPlanning.mutate({
          description: row.description,
          amount: row.amount,
          eventId: row.eventId,
          contactName: row.contactName,
          isPaid: row.isPaid,
          contactId: row.contactId,
        });
        window.location.reload();
      }
    });
};
