import {
  component$,
  useClientEffect$,
  useSignal,
  useStyles$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { EventInterface, TableGuestType } from "~/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";
import type { EventType } from "@prisma/client";
import { QwikModal } from "~/integrations/react/modal";
import styles from "~/table.css?inline";

export default component$(() => {
  useStyles$(styles);
  const { params } = useLocation();
  const newEventStore = useSignal<EventInterface>();
  const navigate = useNavigate();
  const modalOpen = useSignal<boolean>(false);
  const tableRows = useSignal<TableGuestType[]>([
    {
      id: "",
      email: "",
      firstname: "",
      lastname: "",
      special_needs: "",
      index: 0,
    },
  ]);
  const userEmail = useSignal<string>("");

  useClientEffect$(async ({ track }) => {
    track(() => userEmail.value);
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate.path = paths.login;
    }

    userEmail.value = userDetails.data.user?.email ?? "";

    const event = await getCurrentEvent(params.eventId);
    if (event) {
      if (event.date < new Date()) {
        navigate.path = paths.previousEvent + params.eventId;
      }

      const currentEvent: EventInterface = {
        budget: +event.budget,
        date: event.date,
        email: event.email,
        headcount: event.headcount,
        locationId: event.locationId,
        name: event.name,
        type: event.type,
      };
      newEventStore.value = currentEvent;
      console.log(params);
      console.log(
        newEventStore.value?.date.toISOString().replace(":00.000Z", "")
      );
      const result = await client.getGuests.query({
        email: userEmail.value,
      });

      console.log(result.guests);
      result.guests.map((guest) => {
        tableRows.value = [];
        console.log(guest);
        let newIndex = 0;
        if (tableRows.value.at(-1)?.index != undefined) {
          newIndex = tableRows.value.at(-1)!.index + 1 ?? 0;
        }

        const tableGuest: TableGuestType = {
          email: guest.email,
          firstname: guest.firstname,
          id: guest.id,
          lastname: guest.lastname,
          special_needs: guest.special_needs,
          index: newIndex,
        };
        tableRows.value.push(tableGuest);
        // tableRows.value = [...tableRows.value];
      });
      tableRows.value.push({
        id: "",
        email: "",
        firstname: "",
        lastname: "",
        special_needs: "",
        index: 0,
      });
    }
  });

  return (
    <div>
      <label for="budget">Budget:</label>
      <input
        type="number"
        onChange$={(event) =>
          (newEventStore.value!.budget = +(event.target as HTMLInputElement)
            .value)
        }
        value={newEventStore.value?.budget}
      ></input>
      <label for="date">Date:</label>
      <input type="hidden" id="timezone" name="timezone" value="-08:00" />
      <input
        type="datetime-local"
        pattern="\d{4}-\d{2}-\d{2}T\d{2}\d{2}"
        onChange$={(event) => {
          console.log((event.target as HTMLInputElement).value);
          newEventStore.value!.date = new Date(
            (event.target as HTMLInputElement).value
          );
          console.log(newEventStore.value!.date);
        }}
        value={newEventStore.value?.date.toISOString().replace(":00.000Z", "")}
      ></input>
      <input
        type="number"
        onChange$={(event) =>
          (newEventStore.value!.headcount = +(event.target as HTMLInputElement)
            .value)
        }
        value={newEventStore.value?.headcount}
      ></input>
      <input
        type="text"
        onChange$={(event) =>
          (newEventStore.value!.name = (event.target as HTMLInputElement).value)
        }
        value={newEventStore.value?.name}
      ></input>
      <select
        id="eventType"
        name="eventType"
        onClick$={(event) =>
          (newEventStore.value!.type = (event.target as HTMLInputElement)
            .value as EventType)
        }
      >
        <option value="" selected disabled hidden>
          {newEventStore.value!.type}
        </option>
        <option value="WEDDING">WEDDING</option>
        <option value="GRADUATION">GRADUATION</option>
        <option value="PARTY">PARTY</option>
        <option value="CONFERENCE">CONFERENCE</option>
        <option value="EXHIBITION">EXHIBITION</option>
        <option value="CUSTOM">CUSTOM</option>
      </select>
      <button onClick$={() => (modalOpen.value = true)}>Guestlist</button>
      <QwikModal client:load isOpen={modalOpen.value} ariaHideApp={false}>
        <button onClick$={() => (modalOpen.value = false)}>
          Close Guestlist
        </button>
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
              {tableRows.value
                .sort(
                  (guest1, guest2) =>
                    +!guest1.firstname - +!guest2.firstname ||
                    guest1.firstname.localeCompare(guest2.firstname)
                )
                .map((guest) => {
                  console.log(guest);
                  return (
                    <tr key={guest.index}>
                      <td>
                        <input
                          onChange$={(event) =>
                            tableRows.value.map((row) => {
                              console.log(row.index);
                              if (row.index === guest.index) {
                                console.log(guest.index);
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
                            tableRows.value.map((row) => {
                              if (row.index === guest.index) {
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
                            tableRows.value.map((row) => {
                              if (row.index === guest.index) {
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
                            tableRows.value.map((row) => {
                              if (row.index === guest.index) {
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
                          disabled={tableRows.value.length === 1}
                          onClick$={async () => {
                            const isNewRow = await client.getGuest.query({
                              guestId: guest.id,
                            });

                            if (isNewRow.status !== "NOT FOUND") {
                              await client.deleteGuest.mutate({
                                guestId: guest.id,
                              });
                            }

                            tableRows.value.forEach((row, index) => {
                              if (row.index === guest.index)
                                tableRows.value.splice(index, 1);
                            });
                            tableRows.value = [...tableRows.value];
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
        <button
          onClick$={() => {
            tableRows.value = [
              ...tableRows.value,
              {
                id: "",
                email: "",
                firstname: "",
                lastname: "",
                special_needs: "",
                index: tableRows.value.at(-1)!.index + 1,
              },
            ];
            console.log(tableRows.value);
          }}
        >
          Add Row
        </button>
        <button
          onClick$={async () => {
            console.log(tableRows.value);
            tableRows.value
              .filter((guest) => {
                return guest.firstname && guest.lastname;
              })
              .forEach(async (guest) => {
                console.log(guest);
                const result = await client.getGuest.query({
                  guestId: guest.id,
                });
                console.log(result.guest);
                const existingGuest = result.guest;
                if (result.status === "success") {
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
                      userEmail: userEmail.value,
                    });
                    window.location.reload();
                  }
                } else {
                  await client.createGuestAndConnectToEvent.mutate({
                    guestId: guest.id,
                    email: guest.email,
                    firstname: guest.firstname,
                    lastname: guest.lastname,
                    specialNeeds: guest.special_needs,
                    userEmail: userEmail.value,
                    eventId: params.eventId,
                  });
                  window.location.reload();
                }
              });
          }}
        >
          Save Guestlist
        </button>
      </QwikModal>
      <input
        preventdefault:click
        type="button"
        value="save"
        onClick$={() => {
          if (newEventStore.value) {
            client.updateEvent.mutate({
              id: params.eventId,
              userEmail: newEventStore.value.email,
              budget: +newEventStore.value.budget,
              date: newEventStore.value.date,
              headcount: newEventStore.value.headcount,
              locationId: newEventStore.value.locationId,
              name: newEventStore.value.name,
              type: newEventStore.value.type,
            });
            window.location.reload();
          }
        }}
      />
      <input
        preventdefault:click
        type="button"
        value="delete"
        onClick$={() => {
          const result = window.prompt(
            "Do you really want to delete this event? (To do so, type yes)"
          );
          if (result?.toLowerCase() === "yes") {
            client.deleteEvent.mutate({
              id: params.eventId,
            });
            navigate.path = paths.events;
          }
        }}
      />
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const result = await client.getEvents.query({
    email: (await getUser()).data.user?.email ?? "",
  });

  return {
    params: result.events
      .filter((event) => event.date >= new Date())
      .map((event) => {
        const id = event.id;
        return {
          id,
        };
      }),
  };
};

export async function getCurrentEvent(eventId: string) {
  const result = await client.getEvent.query({ id: eventId });
  return result.event;
}
