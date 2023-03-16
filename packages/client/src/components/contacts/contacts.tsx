import {
  component$,
  useVisibleTask$,
  useSignal,
  useStore,
} from "@builder.io/qwik";
import { useNavigate, useLocation } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import { generateRoutingLink } from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import type { ContactProps, ContactStore } from "~/utils/types";
import { $translate as t, Speak } from "qwik-speak";

export const Contact = component$((props: ContactProps) => {
  const location = useLocation();
  const store = useStore<ContactStore>({
    contacts: [],
    userEmail: props.userEmail,
    empty: undefined,
    lastpage: 0,
    currentCursor: undefined,
    oldCursor: undefined,
    nextButtonClicked: undefined,
    endOfList: false,
  });
  const navigate = useNavigate();
  const searchInput = useSignal<string>("");

  useVisibleTask$(async ({ track }) => {
    track(() => props.userEmail);
    track(() => store.currentCursor);
    track(() => searchInput.value);
    store.contacts = [];
    if (store.userEmail === "") {
      store.userEmail = (await getUser()).data.user?.email ?? "";
    }

    const result = await client.getContactsPagination.query({
      userEmail: store.userEmail,
      skip: store.lastpage > 0 ? 1 : undefined,
      cursor: store.currentCursor,
      take:
        store.nextButtonClicked ||
        store.nextButtonClicked === undefined ||
        store.currentCursor === undefined
          ? 10
          : -10,
      filter: searchInput.value,
    });

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
    store.endOfList = store.contacts.length !== 10;
    if (store.contacts.length > 0) {
      store.empty = false;
    } else {
      store.empty = true;
    }
  });

  return (
    <Speak assets={["contacts", "common"]}>
      <div class="m-auto w-1/2 p-2.5">
        <input
          preventdefault:change
          onChange$={(event) => {
            searchInput.value = (
              event.target as HTMLInputElement
            ).value.toLowerCase();
          }}
          type="search"
          class="mb-6 p-4 bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
          placeholder={t("common.search@@Search..")}
        />
      </div>
      <div class="relative overflow-x-auto sm:rounded-lg">
        {store.empty === undefined ? (
          ""
        ) : !store.empty ? (
          <div>
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr class="border-b border-neutral-700 bg-green-800 text-neutral-50 dark:border-neutral-600 dark:bg-indigo-400 dark:text-black">
                  <th scope="col" class="px-6 py-4 text-base">
                    {t("common.firstname@@First name")}
                  </th>
                  <th scope="col" class="px-6 py-4 text-base">
                    {t("common.description@@Description")}
                  </th>
                  <th scope="col" class="px-6 py-4 text-base">
                    {t("common.email@@Email")}
                  </th>
                  <th scope="col" class="px-6 py-4 text-base">
                    {t("common.phone@@Phone")}
                  </th>
                  <th scope="col" class="px-6 py-4 text-base"></th>
                </tr>
              </thead>
              <tbody>{generateContactList(store)}</tbody>
            </table>
            <div class="mt-6">
              <button
                disabled={store.lastpage === 0}
                onClick$={() => {
                  store.nextButtonClicked = false;
                  store.lastpage--;
                  const oldCursor = store.oldCursor;
                  store.oldCursor = store.currentCursor;
                  store.currentCursor = oldCursor;
                }}
                type="button"
                class="float-left px-4 py-2 mr-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  class="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
              <button
                disabled={store.endOfList}
                onClick$={() => {
                  store.nextButtonClicked = true;
                  store.lastpage++;
                  store.oldCursor = store.currentCursor;
                  store.currentCursor = store.contacts.at(-1)?.id;
                }}
                type="button"
                class="float-right px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  class="w-5 h-5 ml-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <h1 class="mt-6 mb-6 text-3xl font-bold text-black dark:text-white text-center">
            {t("contacts.noContacts@@You have no contacts yet.")}
            &#128567;
          </h1>
        )}
      </div>
      <button
        class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
        onClick$={() =>
          navigate(generateRoutingLink(location.params.lang, paths.newContact))
        }
      >
        {t("contacts.addContact@@Add Contact")}
      </button>
    </Speak>
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
                {t("common.deleteRow@@Delete Row")}
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
};
