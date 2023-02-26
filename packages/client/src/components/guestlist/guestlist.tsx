import { component$, useClientEffect$, useStore } from "@builder.io/qwik";
import type { GuestListProps, GuestListStore } from "~/utils/types";
import { client } from "~/utils/trpc";
import { Status } from "event-organiser-api-server/src/status.enum";
import { QwikModal } from "~/integrations/react/modal";
import { capitalize } from "~/utils/common.functions";

export const EMPTY_ROW = {
  id: "",
  email: "",
  firstname: "",
  lastname: "",
  special_needs: "",
};

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

  useClientEffect$(async ({ track }) => {
    track(() => store.useClientEffectHook);
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
    store.tableRows = [...result.guests, EMPTY_ROW];
    store.unselectedGuests = [...store.connectableGuests];

    console.log(store.connectableGuests);
  });

  return (
    <div>
      <div class="table-wrapper">
        <table class="fl-table">
          <thead>
            <tr>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>Email</th>
              <th>Special Needs</th>
              <th>Delete Row</th>
            </tr>
          </thead>
          <tbody>{generateEventGuestTable(store, props)}</tbody>
        </table>
      </div>
      <QwikModal
        client:load
        // @ts-ignore: Type is not assignable to type
        isOpen={store.modalOpen}
        ariaHideApp={false}
        style={customStyles}
      >
        <button onClick$={() => (store.modalOpen = false)}>
          Close existing guestlist
        </button>
        <div class="table-wrapper">
          <table class="fl-table">
            <thead>
              <tr>
                <th>Firstname</th>
                <th>Lastname</th>
                <th>Email</th>
                <th>Special Needs</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>{generateSelectableGuestTable(store)}</tbody>
          </table>
        </div>
        <button
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
        onClick$={() => {
          store.tableRows = [...store.tableRows, EMPTY_ROW];
        }}
      >
        Add Row
      </button>
      <input
        type="submit"
        value="Save Guestlist"
        preventdefault:click
        onClick$={async () => {
          saveGuestList(store, props);
        }}
      ></input>
      <button
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
  return store.connectableGuests
    .sort((guest1, guest2) => guest1.firstname.localeCompare(guest2.firstname))
    .map((guest) => {
      console.log(guest);
      return (
        <tr>
          <td>{guest.firstname}</td>
          <td>{guest.lastname}</td>
          <td>{guest.email}</td>
          <td>{guest.special_needs}</td>
          <td>
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
  return store.tableRows
    .sort(
      (guest1, guest2) =>
        +!guest1.firstname - +!guest2.firstname ||
        guest1.firstname.localeCompare(guest2.firstname)
    )
    .map((guest) => {
      console.log(guest);
      return (
        <tr>
          <td>
            <input
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
          <td>
            <input
              type="text"
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
          <td>
            <input
              type="email"
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
          <td>
            <input
              type="text"
              onChange$={(event) =>
                store.tableRows.map((row) => {
                  if (row.id === guest.id) {
                    row.special_needs = (
                      event.target as HTMLInputElement
                    ).value;
                  }
                })
              }
              value={guest.special_needs}
            ></input>
          </td>
          <td>
            <input
              preventdefault:click
              type="button"
              value="Delete row"
              onClick$={async () => {
                let rowFound = false;
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
              }}
            ></input>
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
          existingGuest?.firstname.toLowerCase() !==
            guest.firstname.toLowerCase() ||
          existingGuest?.lastname.toLowerCase() !==
            guest.lastname.toLowerCase() ||
          existingGuest?.email.toLowerCase() !== guest.email ||
          existingGuest?.special_needs.toLowerCase() !==
            guest.special_needs.toLowerCase()
        ) {
          await client.updateGuest.mutate({
            guestId: guest.id,
            email: guest.email.toLowerCase(),
            firstname: capitalize(guest.firstname),
            lastname: capitalize(guest.lastname),
            specialNeeds: guest.special_needs,
            userEmail: props.userEmail,
          });
          window.location.reload();
        }
      } else if (props.openedFromEvent) {
        await client.createGuestAndConnectToEvent.mutate({
          guestId: guest.id,
          email: guest.email.toLowerCase(),
          firstname: capitalize(guest.firstname),
          lastname: capitalize(guest.lastname),
          specialNeeds: guest.special_needs,
          userEmail: props.userEmail.toLowerCase(),
          eventId: props.eventId ?? "",
        });
        window.location.reload();
      } else if (!props.openedFromEvent) {
        await client.createGuest.mutate({
          firstname: capitalize(guest.firstname),
          lastname: capitalize(guest.lastname),
          email: guest.email.toLowerCase(),
          specialNeeds: guest.special_needs,
          userEmail: props.userEmail.toLowerCase(),
        });
        window.location.reload();
      }
    });
};
