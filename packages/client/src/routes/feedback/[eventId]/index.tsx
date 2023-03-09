import { component$, useBrowserVisibleTask$, useStore } from "@builder.io/qwik";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import { useLocation } from "@builder.io/qwik-city";
import { getCurrentEvent } from "~/routes/(event)/event/[eventId]";
import type {
  FeedbackStore,
  LocationStore,
  NewEventStore,
} from "~/utils/types";
import { EventType } from "@prisma/client";
import { Status } from "event-organiser-api-server/src/status.enum";

export default component$(() => {
  const { params } = useLocation();
  const store = useStore<FeedbackStore>({
    event: {
      budget: 0,
      decorNeeded: false,
      userEmail: "",
      endDate: new Date(),
      headcount: 0,
      locationId: params.eventId,
      menuNeeded: false,
      name: "",
      performerNeeded: false,
      startDate: new Date(),
      type: EventType.CUSTOM,
    },
    location: {
      addressId: "",
      city: "",
      countryId: 0,
      description: "",
      userEmail: "",
      link: "",
      name: "",
      phone: "",
      price: 0,
      state: "",
      street: "",
      type: "",
      zipCode: 0,
    },
    guest: {
      diabetes: false,
      email: "",
      firstname: "",
      gluten: false,
      lactose: false,
      lastname: "",
      plusOne: false,
      additional: "",
    },
    eventExists: undefined,
  });

  useBrowserVisibleTask$(async () => {
    const event = await getCurrentEvent(params.eventId);

    if (event) {
      const currentEvent: NewEventStore = {
        budget: +event.budget,
        startDate: event.startDate ?? undefined,
        endDate: event.endDate ?? undefined,
        userEmail: event.userEmail,
        headcount: event.headcount ?? undefined,
        locationId: event.locationId,
        name: event.name,
        type: event.type ?? undefined,
        decorNeeded: event.decorNeeded,
        menuNeeded: event.menuNeeded,
        performerNeeded: event.performerNeeded,
      };

      const currentLocation: LocationStore = {
        addressId: event.location.addressId,
        city: event.location.address.city,
        countryId: event.location.address.countryId,
        description: event.location.description ?? undefined,
        userEmail: event.location.userEmail,
        link: event.location.link ?? undefined,
        name: event.location.name,
        phone: event.location.phone ?? undefined,
        price: event.location.price as unknown as number,
        state: event.location.address.state ?? undefined,
        street: event.location.address.street,
        type: event.location.type ?? undefined,
        zipCode: event.location.address.zip_code as unknown as number,
      };

      store.event = currentEvent;
      store.location = currentLocation;
      store.eventExists = true;
    } else {
      store.eventExists = false;
    }
  });

  return (
    <div>
      <div style={store.eventExists === undefined ? "display:none" : ""}>
        {store.eventExists ? (
          <div id="content">
            <form
              preventdefault:submit
              class="text-center"
              onSubmit$={() => submitForm(store, params.eventId)}
            >
              <h1 class="mb-6 text-xl font-semibold text-black dark:text-white">
                {store.event.name}
              </h1>
              <h2 class="mb-6 text-lg font-semibold text-black dark:text-white">
                Organiser: {store.event.userEmail}
              </h2>
              <div>
                <label
                  for="firstname"
                  class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                >
                  First name:
                </label>
                <input
                  class="ml-auto mr-auto text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onInput$={(event) =>
                    (store.guest.firstname = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="text"
                  placeholder="Sarah"
                  minLength={2}
                  required
                ></input>
              </div>
              <div>
                <label
                  for="lastname"
                  class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Last name:
                </label>
                <input
                  class="ml-auto mr-auto text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onInput$={(event) =>
                    (store.guest.lastname = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="text"
                  placeholder="Smith"
                  minLength={2}
                  required
                ></input>
              </div>
              <div>
                <label
                  for="email"
                  class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email:
                </label>
                <input
                  class="ml-auto mr-auto text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onInput$={(event) =>
                    (store.guest.email = (
                      event.target as HTMLInputElement
                    ).value).toLowerCase()
                  }
                  type="email"
                  placeholder="sarah.smith@example.com"
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                  minLength={2}
                  required
                ></input>
              </div>
              <div>
                <label
                  class="mb-2 mt-6 mr-1 text-sm font-medium text-gray-900 dark:text-white"
                  for="lactose"
                >
                  Are you lactose intolerant?
                </label>
                <input
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  type="checkbox"
                  onChange$={(event) =>
                    (store.guest.lactose = (
                      event.target as HTMLInputElement
                    ).checked)
                  }
                ></input>
              </div>
              <div>
                <label
                  class="mb-2 mt-6 mr-1 text-sm font-medium text-gray-900 dark:text-white"
                  for="gluten"
                >
                  Are you gluten intolerant?
                </label>
                <input
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  type="checkbox"
                  onChange$={(event) =>
                    (store.guest.gluten = (
                      event.target as HTMLInputElement
                    ).checked)
                  }
                ></input>
              </div>
              <div>
                <label
                  class="mb-2 mt-6 mr-1 text-sm font-medium text-gray-900 dark:text-white"
                  for="diabetes"
                >
                  Are you suffering from diabetes?
                </label>
                <input
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  type="checkbox"
                  onChange$={(event) =>
                    (store.guest.diabetes = (
                      event.target as HTMLInputElement
                    ).checked)
                  }
                ></input>
              </div>
              <div>
                <label
                  class="mb-2 mt-6 mr-1 text-sm font-medium text-gray-900 dark:text-white"
                  for="plusOne"
                >
                  Do you intend to bring a plus one?
                </label>
                <input
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  type="checkbox"
                  onChange$={(event) =>
                    (store.guest.plusOne = (
                      event.target as HTMLInputElement
                    ).checked)
                  }
                ></input>
              </div>
              <div>
                <label
                  for="additional"
                  class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Anything else the organiser should know:
                </label>
                <input
                  class="ml-auto mr-auto text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onInput$={(event) =>
                    (store.guest.additional = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="text"
                  placeholder="Additional details..."
                  minLength={2}
                ></input>
              </div>
              <button
                type="submit"
                class="ml-auto mr-auto mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                Submit Form
              </button>
            </form>
          </div>
        ) : (
          <h1 class="mb-6 text-3xl font-bold text-black dark:text-white text-center">
            &#128721; Oops, Page Not Found! &#128566;
          </h1>
        )}
      </div>
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const result = await client.getFeedbackEvents.query();

  return {
    params: result.events?.map((event) => {
      const id = event.id;
      return {
        id,
      };
    }),
  };
};

export const submitForm = async (store: FeedbackStore, eventId: string) => {
  const contentDiv = document.getElementById("content");
  let newContentDiv = `<h1 class="text-center mb-6 text-xl font-semibold text-black dark:text-white">You are not eligible to participate in this event! &#9995;</h1>`;
  const guestId = await client.getGuestByEmails.query({
    guestEmail: store.guest.email,
    userEmail: store.event.userEmail,
  });


  if (guestId.guestId) {
    const statusResult = await client.getEventGuest.query({
      eventId: eventId,
      guestId: guestId.guestId.id,
    });

    if (statusResult.status === Status.SUCCESS) {
      const feedbackResult = await client.getFeedback.query({
        eventId: eventId,
        guestEmail: store.guest.email,
      });

      newContentDiv = `<h1 class="text-center mb-6 text-xl font-semibold text-black dark:text-white">You already filled out the form for this event! &#128204;</h1>`;
      if (feedbackResult.status === Status.NOT_FOUND) {
        newContentDiv = `<h1 class="text-center mb-6 text-xl font-semibold text-black dark:text-white">Thank you for filling this form! &#9989;</h1>`;

        client.addFeedback.mutate({
          eventId: eventId,
          guestEmail: store.guest.email,
          diabetes: store.guest.diabetes,
          firstname: store.guest.firstname,
          gluten: store.guest.gluten,
          lactose: store.guest.lactose,
          lastname: store.guest.lastname,
          plusOne: store.guest.plusOne,
          additional: store.guest.additional,
        });
      }
    }
  }

  if (contentDiv) {
    contentDiv.innerHTML = newContentDiv;
  }
};
