import {
  component$,
  useBrowserVisibleTask$,
  useStore,
  useStyles$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import styles from "~/table.css?inline";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import type { ContactProps, ContactStore } from "~/utils/types";

export const Contact = component$((props: ContactProps) => {
  useStyles$(styles);
  const store = useStore<ContactStore>({
    contacts: [],
    userEmail: props.userEmail,
  });
  const navigate = useNavigate();

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => props.userEmail);
    if (store.userEmail === "") {
      store.userEmail = (await getUser()).data.user?.email ?? "";
    }

    const result = await client.getContacts.query({ email: store.userEmail });
    if (result.status === Status.SUCCESS) {
      result.contacts?.forEach((contact) => {
        store.contacts.push({
          id: contact.id,
          description: contact.description ?? undefined,
          email: contact.email ?? undefined,
          name: contact.name,
          phone: contact.phone ?? undefined,
        });
      });
    }
    store.contacts = [...store.contacts];
  });

  return (
    <div>
      <div class="table-wrapper">
        <table class="fl-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>{generateContactList(store)}</tbody>
        </table>
      </div>
      
      <button onClick$={() => (navigate(paths.newContact))}>
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
            <td>{row.email}</td>
            <td>{row.phone}</td>
          </tr>
        );
      })}
    </>
  );
};
