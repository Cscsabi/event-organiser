import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useStore,
  useContext,
} from "@builder.io/qwik";
import type { EventInterface } from "~/types";
import { EventType } from "@prisma/client";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { CTX } from "~/routes/layout";

export default component$(() => {
  const navigate = useNavigate();
  const context = useContext(CTX);
  const store = useStore<EventInterface>({
    name: "",
    type: EventType.CUSTOM,
    date: new Date(),
    budget: 0,
    locationId: "",
    email: context.value,
    headcount: 0,
  });

  const resource = useResource$((context) => {
    context.track(() => store.email);
    const result = client.getLocations.query({ email: store.email });
    return result;
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
              navigate.path = paths.event;
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
          <option value="" selected disabled hidden>
            Choose here
          </option>
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
                <option value="" selected disabled hidden>
                  Choose here
                </option>
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
