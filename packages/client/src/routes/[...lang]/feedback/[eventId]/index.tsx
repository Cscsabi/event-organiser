import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
  type StaticGenerateHandler,
  type DocumentHead,
  useLocation,
} from "@builder.io/qwik-city";
import { EventType } from "@prisma/client";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import { getCurrentEvent } from "~/utils/common.functions";
import { client } from "~/utils/trpc";
import type {
  FeedbackStore,
  LocationStore,
  NewEventStore,
  UserContext,
} from "~/utils/types";

export default component$(() => {
  const user = useStore<UserContext>({});
  const { params } = useLocation();
  const store = useStore<FeedbackStore>({
    event: {
      budget: 0,
      endDate: new Date(),
      headcount: 0,
      locationId: params.eventId,
      name: "",
      startDate: new Date(),
      type: EventType.CUSTOM,
    },
    location: {
      addressId: "",
      city: "",
      countryId: 0,
      description: "",
      link: "",
      name: "",
      phone: "",
      price: 0,
      state: "",
      street: "",
      type: "INTERIOR",
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
    eventExists: true,
    notEligible: t(
      "feedback.notEligible@@You are not eligible to participate in this event!"
    ),
    thankYou: t("feedback.thankYou@@Thank you for filling this form!"),
    alreadyFilledForm: t(
      "feedback.alreadyFilledForm@@You already filled out the form for this event!"
    ),
  });

  useVisibleTask$(async () => {
    const event = await getCurrentEvent(params.eventId);

    if (event) {
      user.userEmail = event.userEmail;
      user.firstname = event.user.firstname;
      user.lastname = event.user.lastname;
      const currentEvent: NewEventStore = {
        budget: +event.budget,
        startDate: event.startDate ?? undefined,
        endDate: event.endDate ?? undefined,
        headcount: event.headcount ?? undefined,
        locationId: event.locationId,
        name: event.name,
        type: event.type ?? undefined,
      };

      const currentLocation: LocationStore = {
        addressId: event.location.addressId,
        city: event.location.address.city,
        countryId: event.location.address.countryId,
        description: event.location.description ?? undefined,
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
    <Speak assets={["feedback", "common"]}>
      <div>
        {store.eventExists ? (
          <div id="content">
            <form
              preventdefault:submit
              class="text-center"
              onSubmit$={() =>
                submitForm(store, params.eventId, user.userEmail ?? "")
              }
            >
              <h1 class="mb-6 text-3xl font-semibold text-black dark:text-white">
                {store.event.name}
              </h1>
              <h2 class="mb-6 text-2xl font-semibold text-black dark:text-white">
                {t("feedback.organiser@@Organiser:")}{" "}
                {user.firstname + " " + user.lastname}
              </h2>
              <div>
                <label
                  for="firstname"
                  class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
                >
                  {t("common.firstname@@First name:")}
                </label>
                <input
                  class="ml-auto mr-auto text-center bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-1/2 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white placeholder-slate-700"
                  onInput$={(event) =>
                    (store.guest.firstname = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="text"
                  placeholder={t("common.firstnamePlaceholder@@Sarah")}
                  minLength={2}
                  required
                ></input>
              </div>
              <div>
                <label
                  for="lastname"
                  class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
                >
                  {t("common.lastname@@Last name:")}
                </label>
                <input
                  class="ml-auto mr-auto text-center bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-1/2 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white placeholder-slate-700"
                  onInput$={(event) =>
                    (store.guest.lastname = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="text"
                  placeholder={t("common.lastnamePlaceholder@@Smith")}
                  minLength={2}
                  required
                ></input>
              </div>
              <div>
                <label
                  for="email"
                  class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
                >
                  {t("common.email@@Email:")}
                </label>
                <input
                  class="ml-auto mr-auto text-center bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-1/2 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white placeholder-slate-700"
                  onInput$={(event) =>
                    (store.guest.email = (
                      event.target as HTMLInputElement
                    ).value).toLowerCase()
                  }
                  type="email"
                  placeholder={t(
                    "common.emailPlaceholder@@sarah.smith@example.com"
                  )}
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                  minLength={2}
                  required
                ></input>
              </div>
              <div class="mt-4">
                <label
                  class="pr-4 mb-2 mt-12 text-2xl font-medium text-gray-900 dark:text-white"
                  for="lactose"
                >
                  {t("feedback.lactose@@Are you lactose intolerant?")}{" "}
                </label>
                <input
                  class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-600 rounded dark:focus:ring-blue-500 text-sky-600 focus:ring-sky-700 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                  class="pr-4 mb-2 mt-12 text-2xl font-medium text-gray-900 dark:text-white"
                  for="gluten"
                >
                  {t("feedback.gluten@@Are you gluten intolerant?")}{" "}
                </label>
                <input
                  class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-600 rounded dark:focus:ring-blue-500 text-sky-600 focus:ring-sky-700 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                  class="pr-4 mb-2 mt-12 text-2xl font-medium text-gray-900 dark:text-white"
                  for="diabetes"
                >
                  {t("feedback.diabetes@@Are you suffering from diabetes?")}{" "}
                </label>
                <input
                  class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-600 rounded dark:focus:ring-blue-500 text-sky-600 focus:ring-sky-700 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                  class="pr-4 mb-2 mt-12 text-2xl font-medium text-gray-900 dark:text-white"
                  for="plusOne"
                >
                  {t("feedback.plusOne@@Do you intend to bring a plus one?")}{" "}
                </label>
                <input
                  class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-600 rounded dark:focus:ring-blue-500 text-sky-600 focus:ring-sky-700 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                  class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
                >
                  {t(
                    "feedback.additional@@Anything else the organiser should know:"
                  )}
                </label>
                <input
                  class="ml-auto mr-auto text-center bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-1/2 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white placeholder-slate-700"
                  onInput$={(event) =>
                    (store.guest.additional = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="text"
                  placeholder={t(
                    "feedback.additionalPlaceholder@@Additional details..."
                  )}
                  minLength={2}
                ></input>
              </div>
              <button
                type="submit"
                class="ml-auto mr-auto mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {t("feedback.submit@@Submit Form")}
              </button>
            </form>
          </div>
        ) : (
          <h1 class="mb-6 text-3xl font-bold text-black dark:text-white text-center">
            &#128721; {t("feedback.pageNotFound@@Oops, Page Not Found")}{" "}
            &#128566;
          </h1>
        )}
      </div>
    </Speak>
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

export const submitForm = async (
  store: FeedbackStore,
  eventId: string,
  userEmail: string
) => {
  const contentDiv = document.getElementById("content");
  let newContentDiv = `<h1 class="text-center mb-6 text-xl font-semibold text-black dark:text-white">${store.notEligible} &#9995;</h1>`;
  const guestId = await client.getGuestByEmails.query({
    guestEmail: store.guest.email,
    userEmail: userEmail,
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

      newContentDiv = `<h1 class="text-center mb-6 text-xl font-semibold text-black dark:text-white">${store.alreadyFilledForm} &#128204;</h1>`;
      if (feedbackResult.status === Status.NOT_FOUND) {
        newContentDiv = `<h1 class="text-center mb-6 text-xl font-semibold text-black dark:text-white">${store.thankYou} &#9989;</h1>`;

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

export const head: DocumentHead = {
  title: "Login",
};
