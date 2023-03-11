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
              <tr class="border-b border-neutral-700 bg-green-800 text-neutral-50 dark:border-neutral-600 dark:bg-indigo-400 dark:text-black">
                <th scope="col" class="px-6 py-4 text-base">
                  Name
                </th>
                <th scope="col" class="px-6 py-4 text-base">
                  Description
                </th>
                <th scope="col" class="px-6 py-4 text-base">
                  Email
                </th>
                <th scope="col" class="px-6 py-4 text-base">
                  Phone
                </th>
                <th scope="col" class="px-6 py-4 text-base"></th>
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
        class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
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
          <tr class="bg-green-100 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-green-200 dark:hover:bg-gray-700">
            <td
              scope="row"
              class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {row.name}
            </td>
            <td
              scope="row"
              class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {row.description}
            </td>
            <td
              scope="row"
              class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {row.email}
            </td>
            <td
              scope="row"
              class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {row.phone}
            </td>
            <td>
              <button
                class="font-bold text-sm text-indigo-600 dark:text-indigo-500 hover:underline"
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
