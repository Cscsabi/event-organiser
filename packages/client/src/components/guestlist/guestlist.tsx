import {
  component$, useContext, useStore, useVisibleTask$
} from "@builder.io/qwik";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import Modal from "~/components/modal/modal";
import { CTX } from "~/routes/[...lang]/layout";
import { capitalize } from "~/utils/common.functions";
import { client } from "~/utils/trpc";
import type {
  GuestListProps,
  GuestListStore,
  GuestType,
  UserContext
} from "~/utils/types";
import Toast from "../toast/toast";

export const EMPTY_ROW = {
  id: "",
  email: "",
  userEmail: "",
  firstname: "",
  lastname: "",
  description: "",
} as GuestType;

export enum ExecuteUseClientEffect {
  INITIAL,
  DELETE_ROW,
  OPEN_EXISTING_GUESTS,
  ADD_EXISTING_GUESTS,
}

export const GuestList = component$((props: GuestListProps) => {
  const user = useContext(CTX);
  const store = useStore<GuestListStore>({
    tableRows: [],
    connectableGuests: [],
    selectedGuests: [],
    unselectedGuests: [],
    useClientEffectHook: ExecuteUseClientEffect.INITIAL,
    empty: undefined,
    lastpage: 0,
    currentCursor: undefined,
    oldCursor: undefined,
    nextButtonClicked: undefined,
    endOfList: false,
    searchInput: "",
    searchInput2: ""
  });

  useVisibleTask$(async ({ track }) => {
    track(() => store.useClientEffectHook);
    track(() => store.currentCursor);
    track(() => store.searchInput);
    track(() => user.userEmail);
    let result;

    if (props.openedFromEvent) {
      result = await client.getGuests.query({
        userEmail: user.userEmail ?? "",
        filteredByEvent: true,
        eventId: props.eventId ?? "",
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
    console.log("e", store.endOfList);

    if (store.tableRows.length > 0) {
      store.empty = false;
    } else {
      store.empty = true;
    }
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
          class="mb-6 p-4 bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
          placeholder={t("common.search@@Search..")}
        />
      </div>
      <div class="relative overflow-x-auto sm:rounded-lg">
        {store.empty === undefined ? (
          ""
        ) : !store.empty ? (
          ""
        ) : (
          <h1 class="mt-6 mb-6 text-3xl font-bold text-black dark:text-white text-center">
            {t("guestlist.noGuests@@You have no guests yet!")} &#128563;
          </h1>
        )}
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr class="border-b border-neutral-700 bg-green-800 text-neutral-50 dark:border-neutral-600 dark:bg-indigo-400 dark:text-black">
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
          <tbody>{generateEventGuestTable(store, props)}</tbody>
        </table>
        <div class="mt-6">
          <button
            disabled={
              store.lastpage === 0 ||
              (store.searchInput !== "" && store.endOfList)
            }
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
              store.currentCursor = store.tableRows.at(-1)?.id;
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
      <Modal
        id="selectableGuestlistModal"
        name="Existing Guests"
        size="max-w-8xl max-h-6xl max-h-fit overflow-auto"
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
                  class="mb-6 p-4 bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                  placeholder={t("common.search@@Search..")}
                />
              </div>
              <div class="relative overflow-x-auto overflow-y-auto sm:rounded-lg">
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 max-h-fit overflow-auto">
                  <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr class="border-b border-neutral-700 bg-green-800 text-neutral-50 dark:border-neutral-600 dark:bg-indigo-400 dark:text-black">
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
                  <tbody>
                    {generateSelectableGuestTable(store)}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                onClick$={() => {
                  addSelectedGuestsToEvent(store, props.eventId ?? "");
                  console.log("conn2:", store.connectableGuests);
                  console.log("sel2:", store.selectedGuests);
                  console.log("unsel:2", store.unselectedGuests);
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
        class={`${
          props.openedFromEvent ? "" : "hidden"
        } mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600`}
        type="button"
      >
        {t("guestlist.existingGuests@@Show Existing Guests")}
      </button>
      <button
        preventdefault:click
        class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
        onClick$={() => {
          store.tableRows = [...store.tableRows, EMPTY_ROW];
        }}
      >
        {t("common.addRow@@Add Row")}
      </button>
      <button
        class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
        type="submit"
        preventdefault:click
        onClick$={async () => {
          saveGuestList(store, props, user);
          const toast = document.getElementById("successToast");
          if (toast) {
            toast.classList.remove("hidden");
          }
        }}
      >
        {t("guestlist.saveGuestlist@@Save Guestlist")}
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

export const generateSelectableGuestTable = (
  store: GuestListStore,
) => {
  return store.connectableGuests
    .filter((guest) => {
      if (store.searchInput.length > 0) {
        return (
          guest.firstname?.toLowerCase().includes(store.searchInput) ||
          guest.lastname?.toLowerCase().includes(store.searchInput) ||
          guest.email?.toLowerCase().includes(store.searchInput) ||
          guest.description?.toLowerCase().includes(store.searchInput)
        );
      } else {
        return guest;
      }
    })
    .map((guest) => {
      return (
        <tr class="bg-green-100 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-green-200 dark:hover:bg-gray-700">
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
            class="pr-4 mb-2 mt-12 text-lg font-medium text-gray-900 dark:text-white"
          >
            <input
              class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                console.log("conn:", store.connectableGuests);
                console.log("sel:", store.selectedGuests);
                console.log("unsel:", store.unselectedGuests);
              }}
            />
          </td>
        </tr>
      );
    });
};

export const generateEventGuestTable = (
  store: GuestListStore,
  props: GuestListProps
) => {
  return store.tableRows.map((guest) => {
    return (
      <tr class="bg-green-100 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-green-200 dark:hover:bg-gray-700">
        <td scope="row">
          <input
            class="block w-full py-4 px-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-600 focus:border-green-600 dark:bg-inherit dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="text"
            onChange$={(event) =>
              store.tableRows.map((row) => {
                if (row.id === guest.id) {
                  row.firstname = (event.target as HTMLInputElement).value;
                }
              })
            }
            value={guest.firstname}
          ></input>
        </td>
        <td scope="row">
          <input
            type="text"
            class="block w-full py-4 px-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-600 focus:border-green-600 dark:bg-inherit dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange$={(event) =>
              store.tableRows.map((row) => {
                if (row.id === guest.id) {
                  row.lastname = (event.target as HTMLInputElement).value;
                }
              })
            }
            value={guest.lastname}
          ></input>
        </td>
        <td scope="row">
          <input
            type="email"
            class="block w-full py-4 px-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-600 focus:border-green-600 dark:bg-inherit dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            onChange$={(event) =>
              store.tableRows.map((row) => {
                if (row.id === guest.id) {
                  row.email = (event.target as HTMLInputElement).value;
                }
              })
            }
            value={guest.email}
          ></input>
        </td>
        <td scope="row">
          <input
            class="block w-full py-4 px-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-600 focus:border-green-600 dark:bg-inherit dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="text"
            onChange$={(event) =>
              store.tableRows.map((row) => {
                if (row.id === guest.id) {
                  row.description = (event.target as HTMLInputElement).value;
                }
              })
            }
            value={guest.description}
          ></input>
        </td>
        <td scope="row" class="text-center">
          <button
            class="font-bold py-4 text-sm text-indigo-600 dark:text-indigo-500 hover:underline"
            preventdefault:click
            onClick$={async () => {
              let rowFound = false;
              if (
                guest.id === "" &&
                guest.description === "" &&
                guest.email === "" &&
                guest.firstname === "" &&
                guest.lastname === ""
              ) {
                store.tableRows.forEach((row, index) => {
                  if (row.id === guest.id && !rowFound) {
                    store.tableRows.splice(index, 1);
                    rowFound = true;
                    store.tableRows = [...store.tableRows];
                  }
                });
              } else {
                const isNewRow = await client.getGuest.query({
                  guestId: guest.id,
                });

                if (isNewRow.status === Status.SUCCESS) {
                  if (props.openedFromEvent) {
                    await client.deleteEventGuest.mutate({
                      eventId: props.eventId ?? "",
                      guestId: guest.id,
                    });
                  } else {
                    await client.deleteGuest.mutate({
                      guestId: guest.id,
                    });
                  }
                  store.useClientEffectHook = ExecuteUseClientEffect.DELETE_ROW;
                }

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
              }
            }}
          >
            {t("common.deleteRow@@Delete Row")}
          </button>
        </td>
      </tr>
    );
  });
};

export const addSelectedGuestsToEvent = (
  store: GuestListStore,
  eventId: string
) => {
  let guestAdded;
  store.selectedGuests.forEach((selectedGuest) => {
    client.connectGuestToEvent.mutate({
      eventId: eventId,
      guestId: selectedGuest.id,
    });
    guestAdded = true;
  });

  store.tableRows = [...store.tableRows, ...store.selectedGuests];
  store.selectedGuests = [];
  store.connectableGuests = [];
  store.connectableGuests = [...store.unselectedGuests];

  if (guestAdded) {
    store.empty = false;
  }

  const checkboxes = document.getElementsByName("checkbox");
  for (const checkbox of checkboxes) {
    // @ts-ignore Property 'checked' does not exist on type 'HTMLElement'
    checkbox.checked = false;
  }
};

export const saveGuestList = async (
  store: GuestListStore,
  props: GuestListProps,
  user: UserContext
) => {
  store.tableRows
    .filter((guest) => {
      return guest.firstname && guest.lastname;
    })
    .forEach(async (guest) => {
      const result = await client.getGuest.query({
        guestId: guest.id,
      });
      const existingGuest = result.guest;
      if (result.status === Status.SUCCESS) {
        if (
          existingGuest?.firstname?.toLowerCase() !==
            guest.firstname?.toLowerCase() ||
          existingGuest?.lastname?.toLowerCase() !==
            guest.lastname?.toLowerCase() ||
          existingGuest?.email?.toLowerCase() !== guest.email ||
          existingGuest?.description?.toLowerCase() !==
            guest.description?.toLowerCase()
        ) {
          await client.updateGuest.mutate({
            guestId: guest.id,
            email: guest.email?.toLowerCase(),
            firstname: capitalize(guest.firstname ?? ""),
            lastname: capitalize(guest.lastname ?? ""),
            description: guest.description ?? undefined,
            userEmail: user.userEmail ?? "",
          });
        }
      } else if (props.openedFromEvent) {
        await client.createGuestAndConnectToEvent.mutate({
          guestId: guest.id,
          email: guest.email?.toLowerCase(),
          firstname: capitalize(guest.firstname ?? ""),
          lastname: capitalize(guest.lastname ?? ""),
          description: guest.description ?? undefined,
          userEmail: user.userEmail ?? "",
          eventId: props.eventId ?? "",
        });
      } else if (!props.openedFromEvent) {
        await client.createGuest.mutate({
          firstname: capitalize(guest.firstname ?? ""),
          lastname: capitalize(guest.lastname ?? ""),
          email: guest.email?.toLowerCase(),
          description: guest.description ?? undefined,
          userEmail: user.userEmail ?? "",
        });
      }
    });
};
