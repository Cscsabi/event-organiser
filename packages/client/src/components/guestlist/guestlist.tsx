import { component$, useClientEffect$, useStore } from "@builder.io/qwik";
import type { GuestListProps, GuestListStore } from "~/types";
import { client } from "~/utils/trpc";
import { Status } from "event-organiser-api-server/src/status.enum";
import { QwikModal } from "~/integrations/react/modal";

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
        userEmail: props.userEmail,
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
          <tbody>
            {store.tableRows
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
                        onChange$={(event) =>
                          store.tableRows.map((row) => {
                            if (row.id === guest.id) {
                              row.firstname = (
                                event.target as HTMLInputElement
                              ).value;
                              console.log(row);
                            }
                          })
                        }
                        value={guest.firstname}
                      ></input>
                    </td>
                    <td>
                      <input
                        onChange$={(event) =>
                          store.tableRows.map((row) => {
                            if (row.id === guest.id) {
                              row.lastname = (
                                event.target as HTMLInputElement
                              ).value;
                            }
                          })
                        }
                        value={guest.lastname}
                      ></input>
                    </td>
                    <td>
                      <input
                        onChange$={(event) =>
                          store.tableRows.map((row) => {
                            if (row.id === guest.id) {
                              row.email = (
                                event.target as HTMLInputElement
                              ).value;
                            }
                          })
                        }
                        value={guest.email}
                      ></input>
                    </td>
                    <td>
                      <input
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
                      <button
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
                            store.useClientEffectHook =
                              ExecuteUseClientEffect.DELETE_ROW;
                          }

                          store.tableRows.forEach((row, index) => {
                            if (row.id === guest.id && !rowFound) {
                              store.tableRows.splice(index, 1);
                              rowFound = true;
                            }
                          });

                          store.tableRows = [...store.tableRows];
                        }}
                      >
                        Delete row
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
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
            <tbody>
              {store.connectableGuests
                .sort((guest1, guest2) =>
                  guest1.firstname.localeCompare(guest2.firstname)
                )
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
                              store.selectedGuests = [
                                ...store.selectedGuests,
                                guest,
                              ];
                              console.log(store.selectedGuests);
                            } else {
                              store.selectedGuests.forEach((row, index) => {
                                if (row.id === guest.id)
                                  store.selectedGuests.splice(index, 1);
                                console.log(store.selectedGuests);
                              });
                            }
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <button
          preventdefault:click
          onClick$={() => {
            store.selectedGuests.forEach((selectedGuest) => {
              client.connectGuestToEvent.mutate({
                eventId: props.eventId ?? "",
                guestId: selectedGuest.id,
              });
            });

            store.tableRows = [...store.selectedGuests];
            store.modalOpen = false;
            store.useClientEffectHook =
              ExecuteUseClientEffect.OPEN_EXISTING_GUESTS;
            console.log(store.tableRows);
          }}
        >
          Add selected guests to event
        </button>
      </QwikModal>
      <button
        preventdefault:click
        onClick$={() => {
          store.tableRows = [...store.tableRows, EMPTY_ROW];
          console.log(store.tableRows);
        }}
      >
        Add Row
      </button>
      <button
        preventdefault:click
        onClick$={async () => {
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
                  existingGuest?.firstname !== guest.firstname ||
                  existingGuest?.lastname !== guest.lastname ||
                  existingGuest?.email !== guest.email ||
                  existingGuest?.special_needs !== guest.special_needs
                ) {
                  // TODO: Check all update operations
                  await client.updateGuest.mutate({
                    guestId: guest.id,
                    email: guest.email,
                    firstname: guest.firstname,
                    lastname: guest.lastname,
                    specialNeeds: guest.special_needs,
                    userEmail: props.userEmail,
                  });
                  window.location.reload();
                }
              } else if (props.openedFromEvent) {
                await client.createGuestAndConnectToEvent.mutate({
                  guestId: guest.id,
                  email: guest.email,
                  firstname: guest.firstname,
                  lastname: guest.lastname,
                  specialNeeds: guest.special_needs,
                  userEmail: props.userEmail,
                  eventId: props.eventId ?? "",
                });
                window.location.reload();
              } else if (!props.openedFromEvent) {
                await client.createGuest.mutate({
                  firstname: guest.firstname,
                  lastname: guest.lastname,
                  email: guest.email,
                  specialNeeds: guest.special_needs,
                  userEmail: props.userEmail,
                });
              }
            });
        }}
      >
        Save Guestlist
      </button>
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
