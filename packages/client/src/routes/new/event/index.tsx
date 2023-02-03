import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useStore,
} from "@builder.io/qwik";
import type { EventInterface } from "~/types";
import { EventType } from "@prisma/client";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";

export default component$(() => {
  const navigate = useNavigate();
  const store = useStore<EventInterface>({
    name: "",
    type: EventType.WEDDING,
    date: new Date(),
    budget: 0,
    locationId: "d0f359b2-bf6c-43d8-83ac-c7376ce9e055",
    email: "",
    headcount: 0,
  });

  const resource = useResource$(() => {
    return client.getLocations.query();
  });

  useClientEffect$(() => {
    getUser().then((user) => {
      store.email = user.data.user?.email || "";
    });
  });

  return (
    <div>
      <form
        preventdefault:submit
        onSubmit$={() => {
          if (store.locationId === "") {
            // TODO: Fix locationId
            //store.locationId = event.target;
          }
          const status = client.addEvent.mutate({
            budget: store.budget,
            date: new Date(store.date),
            headcount: store.headcount,
            name: store.name,
            type: store.type,
            userEmail: store.email,
            locationId: store.locationId,
          });

          status.then((result) => {
            if (result.status === "success") {
              navigate.path = paths.events;
            }
          });
        }}
      >
        <label for="eventName">Event name:</label>
        <input
          onInput$={(event) =>
            (store.name = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="eventName"
        ></input>
        <label for="eventType">Event type:</label>
        <select
          id="eventType"
          name="eventType"
          onClick$={(event) =>
            (store.type = (event.target as HTMLInputElement).value as EventType)
          }
        >
          <option value="WEDDING">Wedding</option>
          <option value="GRADUATION">Graduation</option>
          <option value="ONLINE">Online</option>
          <option value="CUSTOM">Custom</option>
        </select>
        <label for="date">Date:</label>
        <input
          onInput$={(event) =>
            (store.date = new Date((event.target as HTMLInputElement).value))
          }
          type="date"
          name="email"
        ></input>
        <label for="budget">Event budget:</label>
        <input
          onInput$={(event) =>
            (store.budget = +(event.target as HTMLInputElement).value)
          }
          type="number"
          name="email"
        ></input>
        <label for="headcount">Headcount:</label>
        <input
          onInput$={(event) =>
            (store.headcount = +(event.target as HTMLInputElement).value)
          }
          type="number"
          name="email"
        ></input>
        <Resource
          value={resource}
          onPending={() => <div>Loading...</div>}
          onResolved={(result) => {
            return (
              <select
                name="location"
                onChange$={(event) => {
                  console.log(event.target);
                  store.locationId = (
                    event.target as unknown as HTMLInputElement
                  ).value;
                }}
              >
                {result.locations.map((location) => {
                  return <option value={location.id}>{location.name}</option>;
                })}
                ;
              </select>
            );
          }}
        />
        <input type="submit"></input>
      </form>
    </div>
  );
});
