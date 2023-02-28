import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useStore,
  useStyles$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import { QwikModal } from "~/integrations/react/modal";
import styles from "~/table.css?inline";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import type { ContactCard, ContactProps, ContactStore } from "~/utils/types";

export const Contact = component$((props: ContactProps) => {
  useStyles$(styles);
  const store = useStore<ContactStore>({
    contacts: [],
    modalOpen: false,
    modalContactId: "",
    userEmail: props.userEmail,
  });
  const navigate = useNavigate();

  useClientEffect$(async ({ track }) => {
    track(() => props.userEmail);
    if (store.userEmail === "") {
      store.userEmail = (await getUser()).data.user?.email ?? "";
    }

    const result = await client.getContacts.query({ email: store.userEmail });
    if (result.status === Status.SUCCESS) {
      result.contacts?.forEach((contact) => {
        store.contacts.push({
          id: contact.id,
          description: contact.description,
          email: contact.email,
          name: contact.name,
          phone: contact.phone,
        });
      });
    }
    store.contacts = [...store.contacts];
  });

  const contactCard = useResource$<ContactCard>(({ track, cleanup }) => {
    track(() => store.modalContactId);
    const controller = new AbortController();
    cleanup(() => controller.abort());
    return client.getContact.query({ id: store.modalContactId });
  });

  return (
    <div>
      <div class="table-wrapper">
        <table class="fl-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>{generateContactList(store)}</tbody>
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
                <input type="text" value={result.contact?.name}></input>{" "}
                <label for="description">Description:</label>
                <input
                  type="text"
                  value={result.contact?.description}
                ></input>{" "}
                <label for="phone">Phone:</label>
                <input type="text" value={result.contact?.phone}></input>{" "}
                <label for="email">E-mail:</label>
                <input type="text" value={result.contact?.email}></input>
              </div>
            );
          }}
        />
      </QwikModal>
      <button onClick$={() => (navigate.path = paths.newContact)}>
        Add Contact
      </button>
    </div>
  );
});

export const generateContactList = async (store: ContactStore) => {
  return (
    <>
      {store.contacts.map((row) => {
        return (
          <tr>
            <td>{row.name}</td>
            <td>{row.description}</td>
            <td>
              <button
                onClick$={() => {
                  store.modalOpen = true;
                  store.modalContactId = row.id;
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
