import {
  component$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  useLocation,
  type RouteLocation,
} from "@builder.io/qwik-city";
import { Speak, $translate as t } from "qwik-speak";
import Modal from "~/components/modal/modal";
import { CTX } from "~/routes/[...lang]/layout";
import { generateRoutingLink } from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { GuestListProps, GuestListStore } from "~/utils/types";
import Toast from "~/components/toast/toast";

export const GuestList = component$((props: GuestListProps) => {
  const location = useLocation();
  const user = useContext(CTX);
  const store = useStore<GuestListStore>({
    tableRows: [],
    connectableGuests: [],
    selectedGuests: [],
    unselectedGuests: [],
    lastpage: 0,
    currentCursor: undefined,
    oldCursor: undefined,
    nextButtonClicked: undefined,
    endOfList: false,
    searchInput: "",
    searchInput2: "",
  });

  useVisibleTask$(async ({ track }) => {
    track(() => store.currentCursor);
    track(() => store.searchInput);
    track(() => user.userEmail);
    let result;

    if (props.openedFromEvent) {
      result = await client.getGuests.query({
        userEmail: user.userEmail ?? "",
        filteredByEvent: true,
        eventId: props.eventId ?? "",
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

      store.connectableGuests = [];
      store.connectableGuests = (
        await client.getConnectableGuests.query({
          userEmail: user.userEmail ?? "",
          eventId: props.eventId,
        })
      ).guests;
    } else {
      result = await client.getGuests.query({
        userEmail: user.userEmail ?? "",
        filteredByEvent: false,
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
    }

    store.tableRows = [];
    store.tableRows = [...result.guests];
    store.unselectedGuests = [...store.connectableGuests];
    store.endOfList = store.tableRows.length !== 10;
  });

  return (
    <Speak assets={["guestlist", "common"]}>
      <div class="m-auto w-1/2 p-2.5">
        <input
          preventdefault:change
          onChange$={(event) => {
            store.searchInput = (
              event.target as HTMLInputElement
            ).value.toLowerCase();
          }}
          type="search"
          class="w-full p-4 pl-10 mb-6 rounded-xl border bg-gray-300 border-slate-400 text-gray-900 text-xl rounded-lg p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder={t("common.search@@Search..")}
        />
      </div>
      <div class="relative overflow-x-auto sm:rounded-lg">
        <table class="w-full text-lg text-left text-gray-500 dark:text-gray-400 overflow-auto">
          <thead class="text-xl bg-sky-700 text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
            <tr class="text-neutral-50 dark:bg-black">
              <th scope="col" class="px-6 py-4">
                {t("common.firstname@@First name")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("common.lastname@@Last name")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("common.email@@Email")}
              </th>
              <th scope="col" class="px-6 py-4">
                {t("common.description@@Description")}
              </th>
              <th scope="col" class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {generateEventGuestTable(store, props, location)}
          </tbody>
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
            class="float-left mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
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
              store.currentCursor = store.tableRows.at(-1)?.id;
            }}
            type="button"
            class="float-right mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
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
      <Modal
        id="selectableGuestlistModal"
        name={t("guestlist.uninvitedGuests@@Uninvited guests")}
        size="max-w-8xl max-h-3xl overflow-auto"
        listType=""
        type=""
      >
        <div>
          {store.connectableGuests.length > 0 ? (
            <div>
              <div class="m-auto w-1/2 p-2.5">
                <input
                  preventdefault:change
                  onInput$={(event) => {
                    store.searchInput2 = (
                      event.target as HTMLInputElement
                    ).value.toLowerCase();
                  }}
                  type="search"
                  class="w-3/5 min-w-[40rem] p-4 pl-10 mb-6 rounded-xl border bg-gray-300 border-slate-400 text-gray-900 text-xl rounded-lg p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder={t("common.search@@Search..")}
                />
              </div>
              <div class="relative overflow-x-auto overflow-y-auto sm:rounded-lg">
                <table class="w-full text-lg text-left text-gray-500 dark:text-gray-400 overflow-auto">
                  <thead class="text-xl bg-sky-700 text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                    <tr class="text-neutral-50 dark:bg-black">
                      <th scope="col" class="px-6 py-4">
                        {t("common.firstname@@First name")}
                      </th>
                      <th scope="col" class="px-6 py-4">
                        {t("common.lastname@@Last name")}
                      </th>
                      <th scope="col" class="px-6 py-4">
                        {t("common.email@@Email")}
                      </th>
                      <th scope="col" class="px-6 py-4">
                        {t("common.description@@Description")}
                      </th>
                      <th scope="col" class="px-6 py-4">
                        {t("guestlist.select@@Select")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>{generateSelectableGuestTable(store)}</tbody>
                </table>
              </div>
              <button
                type="button"
                class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick$={() => {
                  addSelectedGuestsToEvent(store, props.eventId ?? "");
                }}
              >
                {t("guestlist.addSelectedGuests@@Add selected guests to event")}
              </button>
            </div>
          ) : (
            <div>
              <h2 class="mb-6 text-3xl font-bold text-black dark:text-white text-center">
                {t("guestlist.noMoreToAdd@@You have no more guests to add!")}
                &#128556;
              </h2>
            </div>
          )}
        </div>
      </Modal>
      <button
        data-modal-target="selectableGuestlistModal"
        data-modal-toggle="selectableGuestlistModal"
        class={`mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600 ${
          props.openedFromEvent ? "" : "hidden"
        }`}
        type="button"
      >
        {t("guestlist.existingGuests@@Show uninvited Guests")}
      </button>
      <Toast
        id="successToast"
        text={t("toast.operationSuccessful@@Operation Successful!")}
        type="success"
        position="top-right"
      ></Toast>
    </Speak>
  );
});

export const generateSelectableGuestTable = (store: GuestListStore) => {
  return store.connectableGuests
    .filter((guest) => {
      if (store.searchInput2.length > 0) {
        return (
          guest.firstname?.toLowerCase().includes(store.searchInput2) ||
          guest.lastname?.toLowerCase().includes(store.searchInput2) ||
          guest.email?.toLowerCase().includes(store.searchInput2) ||
          guest.description?.toLowerCase().includes(store.searchInput2)
        );
      } else {
        return guest;
      }
    })
    .map((guest) => {
      return (
        <tr class="bg-slate-50 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700">
          <td
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {guest.firstname}
          </td>
          <td
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {guest.lastname}
          </td>
          <td
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {guest.email}
          </td>
          <td
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {guest.description}
          </td>
          <td
            scope="row"
            class="px-6 py-4 text-2xl font-medium text-gray-900 dark:text-white"
          >
            <input
              class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-sky-600 focus:ring-sky-700 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
              type="checkbox"
              name="checkbox"
              checked={false}
              onChange$={(event) => {
                const checkbox = event.target as HTMLInputElement;
                if (checkbox.checked) {
                  store.selectedGuests = [...store.selectedGuests, guest];
                  store.unselectedGuests.forEach((row, index) => {
                    if (row.id === guest.id)
                      store.unselectedGuests.splice(index, 1);
                  });
                } else {
                  store.selectedGuests.forEach((row, index) => {
                    if (row.id === guest.id)
                      store.selectedGuests.splice(index, 1);
                  });
                  store.unselectedGuests = [...store.unselectedGuests, guest];
                }
              }}
            />
          </td>
        </tr>
      );
    });
};

export const generateEventGuestTable = (
  store: GuestListStore,
  props: GuestListProps,
  location: RouteLocation
) => {
  return store.tableRows.map((guest) => {
    return (
      <tr class="bg-slate-50 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700">
        <td
          scope="row"
          class="px-6 py-4 text-lg font-medium text-gray-900 whitespace-nowrap dark:text-white"
        >
          {guest.firstname}
        </td>
        <td
          scope="row"
          class="px-6 py-4 text-lg font-medium text-gray-900 whitespace-nowrap dark:text-white"
        >
          {guest.lastname}
        </td>
        <td
          scope="row"
          class="px-6 py-4 text-lg font-medium text-gray-900 whitespace-nowrap dark:text-white"
        >
          {guest.email}
        </td>
        <td
          scope="row"
          class="px-6 py-4 text-lg font-medium text-gray-900 whitespace-nowrap dark:text-white"
        >
          {guest.description}
        </td>
        <td scope="row" class="text-center">
          {props.openedFromEvent ? (
            <button
              class="font-bold py-4 text-lg text-sky-700 dark:text-blue-700 hover:underline"
              preventdefault:click
              onClick$={() => {
                let rowFound = false;
                client.deleteEventGuest.mutate({
                  eventId: props.eventId ?? "",
                  guestId: guest.id,
                });

                store.tableRows.forEach((row, index) => {
                  if (row.id === guest.id && !rowFound) {
                    store.tableRows.splice(index, 1);
                    rowFound = true;
                  }
                });

                store.tableRows = [...store.tableRows];
                store.connectableGuests = [...store.connectableGuests, guest];
                store.unselectedGuests = [...store.connectableGuests];
                store.selectedGuests = [];
              }}
            >
              <i class="fa-solid fa-trash-can fa-xl"></i>
            </button>
          ) : (
            <a
              href={
                generateRoutingLink(location.params.lang, paths.guest) +
                guest.id
              }
            >
              <i class="fa-solid fa-pen-to-square fa-xl cursor-pointer"></i>
            </a>
          )}
        </td>
      </tr>
    );
  });
};

export const addSelectedGuestsToEvent = (
  store: GuestListStore,
  eventId: string
) => {
  store.selectedGuests.forEach((selectedGuest) => {
    client.connectGuestToEvent.mutate({
      eventId: eventId,
      guestId: selectedGuest.id,
    });
  });

  store.tableRows = [...store.tableRows, ...store.selectedGuests];
  store.selectedGuests = [];
  store.connectableGuests = [];
  store.connectableGuests = [...store.unselectedGuests];

  const checkboxes = document.getElementsByName("checkbox");
  for (const checkbox of checkboxes) {
    // @ts-ignore Property 'checked' does not exist on type 'HTMLElement'
    checkbox.checked = false;
  }
};
