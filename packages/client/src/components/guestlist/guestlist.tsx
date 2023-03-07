import { component$, useBrowserVisibleTask$, useStore } from "@builder.io/qwik";
import type { GuestListProps, GuestListStore, GuestType } from "~/utils/types";
import { client } from "~/utils/trpc";
import { Status } from "event-organiser-api-server/src/status.enum";
import { QwikModal } from "~/integrations/react/modal";
import { capitalize } from "~/utils/common.functions";

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
  const store = useStore<GuestListStore>({
    modalOpen: false,
    tableRows: [],
    connectableGuests: [],
    selectedGuests: [],
    unselectedGuests: [],
    useClientEffectHook: ExecuteUseClientEffect.INITIAL,
  });

  const customStyles = {
    content: {
      width: "85%",
      height: "75%",
      transform: "translate(3%, 3%)",
    },
  };

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => store.useClientEffectHook);
    console.log(props);
    let result;

    if (props.openedFromEvent) {
      result = await client.getGuests.query({
        userEmail: props.userEmail.toLowerCase(),
        filteredByEvent: true,
        eventId: props.eventId ?? "",
      });
    } else {
      result = await client.getGuests.query({
        userEmail: props.userEmail,
        filteredByEvent: false,
      });
    }

    store.connectableGuests = [];

    store.connectableGuests = (
      await client.getGuests.query({
        userEmail: props.userEmail,
        connectingOnly: true,
        eventId: props.eventId,
      })
    ).guests;

    store.tableRows = [];
    store.tableRows = [...result.guests];
    store.unselectedGuests = [...store.connectableGuests];

    console.log(store.connectableGuests);
  });

  return (
    <div>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr class="border-b border-neutral-700 bg-violet-900 text-neutral-50 dark:border-neutral-600 dark:bg-neutral-700">
              <th scope="col" class="px-6 py-4">
                Firstname
              </th>
              <th scope="col" class="px-6 py-4">
                Lastname
              </th>
              <th scope="col" class="px-6 py-4">
                Email
              </th>
              <th scope="col" class="px-6 py-4">
                Description
              </th>
              <th scope="col" class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>{generateEventGuestTable(store, props)}</tbody>
        </table>
      </div>
      <QwikModal
        client:load
        // @ts-ignore: Type is not assignable to type
        isOpen={store.modalOpen}
        className="bg-slate-300 dark:bg-gray-600 overflow-hidden absolute inset-10 rounded-2xl p-6"
        style={customStyles}
      >
        <button
          class="text-white mt-6 bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
          onClick$={() => (store.modalOpen = false)}
        >
          Close
        </button>
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr class="border-b border-neutral-700 bg-violet-900 text-neutral-50 dark:border-neutral-600 dark:bg-neutral-700">
                <th scope="col" class="px-6 py-4">
                  Firstname
                </th>
                <th scope="col" class="px-6 py-4">
                  Lastname
                </th>
                <th scope="col" class="px-6 py-4">
                  Email
                </th>
                <th scope="col" class="px-6 py-4">
                  Description
                </th>
                <th scope="col" class="px-6 py-4">
                  Select
                </th>
              </tr>
            </thead>
            <tbody>{generateSelectableGuestTable(store)}</tbody>
          </table>
        </div>
        <button
          class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
          preventdefault:click
          onClick$={() => {
            addSelectedGuestsToEvent(store, props.eventId ?? "");
          }}
        >
          Add selected guests to event
        </button>
      </QwikModal>
      <button
        preventdefault:click
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        onClick$={() => {
          store.tableRows = [...store.tableRows, EMPTY_ROW];
        }}
      >
        Add Row
      </button>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        type="submit"
        preventdefault:click
        onClick$={async () => {
          saveGuestList(store, props);
        }}
      >
        Save Guestlist
      </button>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        preventdefault:click
        onClick$={() => {
          store.modalOpen = true;
          store.useClientEffectHook =
            ExecuteUseClientEffect.ADD_EXISTING_GUESTS;
          console.log(store);
        }}
        style={props.openedFromEvent ? "" : "display:none"}
      >
        Add existing guests
      </button>
    </div>
  );
});

export const generateSelectableGuestTable = (store: GuestListStore) => {
  return store.connectableGuests.map((guest) => {
    console.log(guest);
    return (
      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
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
          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
        >
          <input
            type="checkbox"
            onChange$={(event) => {
              const checkbox = event.target as HTMLInputElement;
              if (checkbox.checked) {
                store.selectedGuests = [...store.selectedGuests, guest];
                store.unselectedGuests.forEach((row, index) => {
                  if (row.id === guest.id)
                    store.unselectedGuests.splice(index, 1);
                });
                console.log(store.selectedGuests);
              } else {
                store.selectedGuests.forEach((row, index) => {
                  if (row.id === guest.id)
                    store.selectedGuests.splice(index, 1);
                  console.log(store.selectedGuests);
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
  props: GuestListProps
) => {
  return store.tableRows.map((guest) => {
    return (
      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
        <td scope="row">
          <input
            class="w-full bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            type="text"
            onChange$={(event) =>
              store.tableRows.map((row) => {
                if (row.id === guest.id) {
                  row.firstname = (event.target as HTMLInputElement).value;
                  console.log(row);
                }
              })
            }
            value={guest.firstname}
          ></input>
        </td>
        <td scope="row">
          <input
            type="text"
            class="w-full bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
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
            class="w-full bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
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
            class="w-full bg-transparent px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
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
            class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
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
              }
            }}
          >
            Delete row
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
  store.selectedGuests.forEach((selectedGuest) => {
    client.connectGuestToEvent.mutate({
      eventId: eventId,
      guestId: selectedGuest.id,
    });
  });

  console.log(store.useClientEffectHook);
  store.tableRows = [...store.tableRows, ...store.selectedGuests];
  store.selectedGuests = [];
  store.connectableGuests = [];
  store.connectableGuests = [...store.unselectedGuests];
  store.modalOpen = false;

  console.log(store.tableRows);
};

export const saveGuestList = async (
  store: GuestListStore,
  props: GuestListProps
) => {
  console.log(store.tableRows);
  store.tableRows
    .filter((guest) => {
      return guest.firstname && guest.lastname;
    })
    .forEach(async (guest) => {
      console.log(guest);
      const result = await client.getGuest.query({
        guestId: guest.id,
      });
      console.log(result.status);
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
            userEmail: props.userEmail,
          });
        }
      } else if (props.openedFromEvent) {
        await client.createGuestAndConnectToEvent.mutate({
          guestId: guest.id,
          email: guest.email?.toLowerCase(),
          firstname: capitalize(guest.firstname ?? ""),
          lastname: capitalize(guest.lastname ?? ""),
          description: guest.description ?? undefined,
          userEmail: props.userEmail.toLowerCase(),
          eventId: props.eventId ?? "",
        });
      } else if (!props.openedFromEvent) {
        await client.createGuest.mutate({
          firstname: capitalize(guest.firstname ?? ""),
          lastname: capitalize(guest.lastname ?? ""),
          email: guest.email?.toLowerCase(),
          description: guest.description ?? undefined,
          userEmail: props.userEmail.toLowerCase(),
        });
      }
    });
};
