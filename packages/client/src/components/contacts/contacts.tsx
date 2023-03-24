import {
  component$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import { CTX } from "~/routes/[...lang]/layout";
import { client } from "~/utils/trpc";
import type { ContactStore } from "~/utils/types";

export const Contact = component$(() => {
  const user = useContext(CTX);
  const store = useStore<ContactStore>({
    contacts: [],
    lastpage: 0,
    currentCursor: undefined,
    oldCursor: undefined,
    nextButtonClicked: undefined,
    endOfList: false,
    searchInput: "",
  });

  useVisibleTask$(async ({ track }) => {
    track(() => user.userEmail);
    track(() => store.currentCursor);
    track(() => store.searchInput);
    store.contacts = [];

    const result = await client.getContactsPagination.query({
      userEmail: user.userEmail ?? "",
      skip: store.lastpage > 0 ? 1 : undefined,
      cursor: store.currentCursor,
      take:
        store.nextButtonClicked ||
        store.nextButtonClicked === undefined ||
        store.currentCursor === undefined
          ? 10
          : -10,
      filter: store.searchInput,
    });

    if (result.status === Status.SUCCESS) {
      result.contacts?.forEach((contact) => {
        store.contacts.push({
          id: contact.id,
          description: contact.description ?? undefined,
          email: contact.email ?? undefined,
          name: contact.name,
          link: contact.link ?? undefined,
          phone: contact.phone ?? undefined,
        });
      });
    }
    store.contacts = [...store.contacts];
    store.endOfList = store.contacts.length !== 10;
  });

  return (
    <Speak assets={["contacts", "common"]}>
      <div class="m-auto w-1/2 p-2.5">
        <input
          preventdefault:change
          onChange$={(event) => {
            store.searchInput = (
              event.target as HTMLInputElement
            ).value.toLowerCase();
          }}
          type="search"
          class="mb-6 p-4 bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
          placeholder={t("common.search@@Search..")}
        />
      </div>
      <div class="relative overflow-x-auto sm:rounded-lg">
        <div>
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr class="border-b border-neutral-700 bg-green-800 text-neutral-50 dark:border-neutral-600 dark:bg-indigo-400 dark:text-black">
                <th scope="col" class="px-6 py-4 text-base">
                  {t("common.name@@Name")}
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
                <th scope="col" class="px-6 py-4 text-base">
                  {t("common.link@@Link")}
                </th>
                <th scope="col" class="px-6 py-4 text-base"></th>
              </tr>
            </thead>
            <tbody>{generateContactList(store)}</tbody>
          </table>
          <div class="mt-6">
            <button
              style={`${
                store.lastpage === 0 ||
                (store.searchInput !== "" && store.endOfList)
                  ? "pointer-events:none"
                  : ""
              }`}
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
              style={`${store.endOfList ? "pointer-events:none" : ""}`}
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
      </div>
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
            <td
              scope="row"
              class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              <a href={row.link} target="_blank">
                {" "}
                {row.link}
              </a>
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
