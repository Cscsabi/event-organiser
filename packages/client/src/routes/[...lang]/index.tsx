import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { $translate as t, Speak } from "qwik-speak";
import InformationCard from "~/components/information-card/information.card";
import { paths } from "~/utils/paths";
import { CTX } from "./layout";
import { type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const user = useContext(CTX);

  useVisibleTask$(async () => {
    const authToken: string = import.meta.env.VITE_AUTH_TOKEN;
    let authTokenValue = "";

    authTokenValue = window.location.hash.slice(1);
    if (
      localStorage.getItem(authToken) === null &&
      authTokenValue.startsWith("access_token")
    ) {
      localStorage.setItem(authToken, authTokenValue);
    }
  });

  return (
    <Speak assets={["home"]}>
      <h1 class="text-center mb-8 mt-6 text-3xl font-bold dark:text-white">
        {t("home.welcome@@Welcome to Event Organiser!")}
      </h1>
      {user.userEmail === undefined ? (
        ""
      ) : user.userEmail === "" ? (
        <div>
          <h2 class="text-center font-semibold text-2xl dark:text-white">
            {t(
              "home.pleaseLogin@@To be able to start organising event first you need to log in to your profile"
            )}
          </h2>
          <div class="flex flex-wrap justify-center">
            <InformationCard
              description={t(
                "home.newAccount@@Click here to create a new account"
              )}
              goTo={paths.register}
              icon="fa-solid fa-user-plus fa-beat fa-xl"
              name={t("home.register@@Register")}
              textCenter
            />
            <InformationCard
              description={t(
                "home.justLogin@@Click here if you already have an account"
              )}
              goTo={paths.login}
              icon="fa-solid fa-user-secret fa-beat fa-xl"
              name={t("home.login@@Login")}
              textCenter
            />
          </div>
        </div>
      ) : (
        <div>
          <h2 class="text-center font-semibold text-2xl dark:text-white">
            {t(
              "home.possibilities@@Start organising! Check out your possibilities:"
            )}
          </h2>
          <div class="flex flex-wrap justify-center">
            <InformationCard
              description={t(
                "home.createLocation@@Go to the Locations tab, click the Add Location button and create a new location"
              )}
              name={t("home.createLocationTitle@@Create a location")}
              icon="fa-solid fa-location-dot fa-bounce fa-xl"
              goTo={paths.newLocation}
            />
            <InformationCard
              description={t(
                "home.createEvent@@Go to the Active Events tab, click the Add Event button and create a new event. Here you can use your predefined location(s)"
              )}
              name={t("home.createEventTitle@@Create an Event")}
              icon="fa-solid fa-champagne-glasses fa-beat-fade fa-xl"
              goTo={paths.newEvent}
            />
            <InformationCard
              description={t(
                "home.addGuests@@Go to the Guests tab, then click the Add Guest button to add a new guest"
              )}
              name={t("home.addGuestsTitle@@Add guests")}
              icon="fa-solid fa-person-circle-plus fa-beat-fade fa-xl"
              goTo={paths.newGuest}
            />
            <InformationCard
              description={t(
                "home.addContacts@@Go to the Contacts tab, then click the Add Contact button to create a new contact"
              )}
              name={t("home.addContactsTitle@@Add contacts")}
              icon="fa-regular fa-id-card fa-bounce fa-xl"
              goTo={paths.newContact}
            />
            <InformationCard
              description={t(
                "home.browsePreviousEvents@@After events took place you can browse them under the Previous Events tab"
              )}
              name={t("home.browsePreviousEventsTitle@@Browse previous events")}
              icon="fa-solid fa-backward fa-beat fa-xl"
              goTo={paths.previousEvents}
            />
            <InformationCard
              description={t(
                "home.manageProfile@@You can manage your profile under the Profile tab (change password/language, check out your calendar)"
              )}
              name={t("home.manageProfileTitle@@Manage your profile")}
              icon="fa-solid fa-user fa-beat-fade fa-xl"
              goTo={paths.profile}
            />
            <InformationCard
              description={t(
                "home.manageEvents@@Now you can manage your ongoing events. Plan your budget, have your guests fill out a generated form etc."
              )}
              name={t("home.manageEventsTitle@@Manage your events")}
              icon="fa-solid fa-circle-check fa-beat fa-xl"
              goTo={paths.events}
            />
          </div>
        </div>
      )}
    </Speak>
  );
});

export const head: DocumentHead = {
  title: "Home",
};
