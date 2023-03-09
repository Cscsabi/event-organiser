import { component$, useBrowserVisibleTask$, useStore } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import type { ContactProps, ContactStore } from "~/utils/types";

export const Contact = component$((props: ContactProps) => {
  const store = useStore<ContactStore>({
    contacts: [],
    userEmail: props.userEmail,
    empty: undefined,
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
    if (store.contacts.length > 0) {
      store.empty = false;
    } else {
      store.empty = true;
    }
  });

  return (
    <div>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        {store.empty === undefined ? (
          ""
        ) : !store.empty ? (
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr class="border-b border-neutral-700 bg-violet-900 text-neutral-50 dark:border-neutral-600 dark:bg-neutral-700">
                <th scope="col" class="px-6 py-4">
                  Name
                </th>
                <th scope="col" class="px-6 py-4">
                  Description
                </th>
                <th scope="col" class="px-6 py-4">
                  Email
                </th>
                <th scope="col" class="px-6 py-4">
                  Phone
                </th>
                <th scope="col" class="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>{generateContactList(store)}</tbody>
          </table>
        ) : (
          <h1 class="mt-6 mb-6 text-3xl font-bold text-black dark:text-white text-center">
            You have no contacts yet. &#128567;
          </h1>
        )}
      </div>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        onClick$={() => navigate(paths.newContact)}
      >
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
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {row.name}
            </td>
            <td
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {row.description}
            </td>
            <td
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {row.email}
            </td>
            <td
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {row.phone}
            </td>
            <td>
              <button
                class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                onClick$={async () => {
                  let rowFound = false;
                  if (
                    row.id === "" &&
                    row.description === "" &&
                    row.email === "" &&
                    row.name === "" &&
                    row.phone === ""
                  ) {
                    store.contacts.forEach((allRows, index) => {
                      if (row.id === allRows.id && !rowFound) {
                        store.contacts.splice(index, 1);
                        rowFound = true;
                        store.contacts = [...store.contacts];
                      }
                    });
                  } else {
                    const isNewRow = await client.getContact.query({
                      id: row.id,
                    });

                    if (isNewRow.status === Status.SUCCESS) {
                      await client.deleteContact.mutate({
                        id: row.id,
                      });
                    }

                    store.contacts.forEach((allRows, index) => {
                      if (row.id === allRows.id && !rowFound) {
                        store.contacts.splice(index, 1);
                        rowFound = true;
                      }
                    });

                    store.contacts = [...store.contacts];
                  }
                }}
              >
                Delete row
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
};
