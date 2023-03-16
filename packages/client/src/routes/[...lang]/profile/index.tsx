import { component$, useVisibleTask$, useStore } from "@builder.io/qwik";
import { useNavigate, useLocation } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { changePassword, getUser, getUserData } from "~/utils/supabase.client";
import { QwikCalendar } from "~/integrations/react/calendar";
import { client } from "~/utils/trpc";
import type { CalendarEvent, ProfilStore } from "~/utils/types";
import Toast from "~/components/toast/toast";
import { Status } from "event-organiser-api-server/src/status.enum";
import Modal from "~/components/modal/modal";
import { generateRoutingLink } from "~/utils/common.functions";
import { $translate as t, Speak } from "qwik-speak";

export default component$(() => {
  const location = useLocation();
  const store = useStore<ProfilStore>({
    email: "",
    firstname: "",
    lastname: "",
    newPassword1: "",
    newPassword2: "",
    date: new Date(),
    events: [],
  });

  const navigate = useNavigate();

  useVisibleTask$(async ({ track }) => {
    track(() => store.email);

    const userResponse = await getUser();
    if (!userResponse.data.user) {
      navigate(generateRoutingLink(location.params.lang, paths.login));
    }

    if (userResponse.data.user?.email) {
      store.email = userResponse.data.user.email;
      const userData = await getUserData(store.email);

      if (userData.user) {
        store.firstname = userData.user.firstname;
        store.lastname = userData.user.lastname;
      }
    }

    store.events = await getEvents(store.email);
  });

  return (
    <Speak assets={["profile", "toast", "common"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("profile.profile@@Profile")}
      </h1>
      <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
        <div>
          <div>
            <label
              for="firstname"
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              {t("common.firstname@@First name:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.firstname = (event.target as HTMLInputElement).value)
              }
              type="text"
              value={store.firstname}
            ></input>
          </div>
          <div>
            <label
              for="lastname"
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              {t("common.lastname@@Last name:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.lastname = (event.target as HTMLInputElement).value)
              }
              type="text"
              value={store.lastname}
            ></input>
          </div>
          <div>
            <label
              for="email"
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              {t("common.email@@Email:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              type="email"
              value={store.email}
              readOnly
            ></input>
          </div>
          <button
            class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
            onClick$={() =>
              save(store).then((result) => {
                if (result.status === Status.SUCCESS) {
                  const toast = document.getElementById("successToast");
                  if (toast) {
                    toast.classList.remove("hidden");
                  }
                } else {
                  const toast = document.getElementById("failedToast");
                  if (toast) {
                    toast.classList.remove("hidden");
                  }
                }
              })
            }
          >
            {t("common.save@@Save")}
          </button>
          <button
            data-modal-target="changePasswordModal"
            data-modal-toggle="changePasswordModal"
            class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
            type="button"
          >
            {t("profile.changePassword@@Change Password")}
          </button>
          <Modal
            id="changePasswordModal"
            name={t("profile.changePassword@@Change Password")}
            size="max-w-xl"
            listType="active-event"
            type=""
          >
            <form
              preventdefault:submit
              onSubmit$={async () => {
                const feedbackParagraph = document.getElementById(
                  "changePasswordFeedback"
                );
                if (store.newPassword1 === store.newPassword2) {
                  document
                    .getElementById("changePasswordFeedback")
                    ?.classList.add("hidden");
                  const userResponse = await changePassword({
                    sendEmailInput: {
                      recieverEmail: store.email,
                      html: `<div><h1>${t("profile.passwordUpdated1@@Dear,")} ${
                        store.firstname
                      }!</h1><h2>${t(
                        "profile.passwordUpdated2@@We would like to inform you, that your password was just changed!"
                      )}</h2></div>`,
                      text: `${t("profile.passwordUpdated1@@Dear,")} ${
                        store.firstname
                      }!\n${t(
                        "profile.passwordUpdated2@@We would like to inform you, that your password was just changed!"
                      )}`,
                      subject: t(
                        "profile.passwordUpdatedSubject@@Your password was updated"
                      ),
                      recieverName: store.firstname + " " + store.lastname,
                    },
                    password: store.newPassword1,
                  });
                  if (!userResponse.error) {
                    window.location.reload();
                  }
                } else {
                  feedbackParagraph?.classList.remove("hidden");
                }
              }}
            >
              <div>
                <label
                  for="password"
                  class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                >
                  {t("common.password@@Password:")}
                </label>
                <input
                  class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                  onInput$={(event) =>
                    (store.newPassword1 = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                ></input>
              </div>
              <div>
                <label
                  for="password"
                  class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                >
                  {t("profile.passwordAgain@@Password again:")}
                </label>
                <input
                  class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                  onInput$={(event) =>
                    (store.newPassword2 = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                ></input>
                <p id="changePasswordFeedback" class="hidden">
                  {t("profile.notMatching@@The passwords are not matching!")}
                </p>
              </div>
              <button
                type="submit"
                class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
              >
                {t("profile.changePassword@@Change")}
              </button>
            </form>
          </Modal>
        </div>
        <div class="flex place-content-end mt-6">
          <QwikCalendar
            client:visible
            onChange$={(event: Date) => {
              store.date = event;
            }}
            value={store.date}
            defaultView="year"
            view="month"
            events={store.events}
          />
        </div>
      </div>
      <Toast
        id="successToast"
        text={t("toast.operationSuccessful@@Operation Successful!")}
        type="success"
        position="top-right"
      ></Toast>
      <Toast
        id="failedToast"
        text={t("toast.operationFailed@@Operation Failed!")}
        type="failed"
        position="top-right"
      ></Toast>
    </Speak>
  );
});

export async function getEvents(email: string) {
  const result = await client.getEvents.query({
    email: email,
  });

  return result.events.map((event) => {
    const calendarEvent: CalendarEvent = {
      name: event.name,
      date: event.startDate ?? undefined,
    };

    return calendarEvent;
  });
}

export function save(store: ProfilStore) {
  return client.updateUser.mutate({
    params: { email: store.email },
    body: {
      firstname: store.firstname,
      lastname: store.lastname,
    },
  });
}
