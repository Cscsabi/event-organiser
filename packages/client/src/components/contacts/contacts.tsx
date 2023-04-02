import {
  component$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import { CTX } from "~/routes/[...lang]/layout";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { ContactStore } from "~/utils/types";
import {
  type RouteNavigate,
  useNavigate,
  type RouteLocation,
  useLocation,
} from "@builder.io/qwik-city";
import { generateRoutingLink } from "~/utils/common.functions";

export const Contact = component$(() => {
  const user = useContext(CTX);
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore<ContactStore>({
    contacts: [],
    currentPageNo: 0,
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
      skip: store.currentCursor !== undefined ? 1 : undefined,
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
    <Speak assets={["contact", "common"]}>
      <div class="m-auto w-1/2 p-2.5">
        <input
          preventdefault:change
          onChange$={(event) => {
            store.searchInput = (
              event.target as HTMLInputElement
            ).value.toLowerCase();
          }}
          type="search"
          class="w-full p-4 pl-10 mb-6 rounded-xl border bg-gray-300 border-slate-400 text-gray-900 text-md rounded-lg p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder={t("common.search@@Search..")}
        />
      </div>
      <div class="relative overflow-x-auto sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 overflow-auto">
          <thead class="text-md bg-sky-700 text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
            <tr class="text-neutral-50 dark:bg-black">
              <th scope="col" class="px-6 py-4">
                {t("common.name@@Name")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("common.description@@Description")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("common.email@@Email")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("common.phone@@Phone")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("common.link@@Link")}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>{generateContactList(store, navigate, location)}</tbody>
        </table>
        <div class="mt-6">
          <button
            style={`${
              store.currentPageNo === 0 ||
              (store.searchInput !== "" && store.endOfList)
                ? "pointer-events:none"
                : ""
            }`}
            onClick$={() => {
              store.nextButtonClicked = false;
              store.currentPageNo--;
              const oldCursor = store.oldCursor;
              store.oldCursor = store.currentCursor;
              store.currentCursor = oldCursor;
            }}
            type="button"
            class="float-left mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
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
              store.currentPageNo++;
              store.oldCursor = store.currentCursor;
              store.currentCursor = store.contacts.at(-1)?.id;
            }}
            type="button"
            class="float-right mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
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
    </Speak>
  );
});

export const generateContactList = async (
  store: ContactStore,
  navigate: RouteNavigate,
  location: RouteLocation
) => {
  return (
    <>
      {store.contacts.map((row) => {
        return (
          <tr class="bg-slate-50 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700">
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
                {row.link}
              </a>
            </td>
            <td
              scope="row"
              class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              <a
                href={
                  generateRoutingLink(location.params.lang, paths.contact) +
                  row.id
                }
              >
                <i class="fa-solid fa-pen-to-square fa-xl cursor-pointer"></i>
              </a>
            </td>
          </tr>
        );
      })}
    </>
  );
};
