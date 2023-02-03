import { component$, useStore } from "@builder.io/qwik";
import type { EventInterface } from "~/types";
import { EventType } from "@prisma/client";

export default component$(() => {
  const store = useStore<EventInterface>({
    name: "",
    type: EventType.CUSTOM,
    date: new Date(),
    budget: 0,
    locationId: "",
    email: "",
    headcount: 0,
  });
  return (
    <div>
      <form>
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
        <input type="submit"></input>
      </form>
    </div>
  );
});
