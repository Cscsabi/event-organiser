import {
  $,
  component$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import {
  $translate as t,
  Speak,
  useSpeakConfig,
  type SpeakLocale,
} from "qwik-speak";
import Modal from "~/components/modal/modal";
import Toast from "~/components/toast/toast";
import { QwikCalendar } from "~/integrations/react/calendar";
import { changePassword, getUserData } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import type { CalendarEvent, ProfilStore, UserContext } from "~/utils/types";
import { CTX } from "../layout";

export default component$(() => {
  const config = useSpeakConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useContext(CTX);

  const store = useStore<ProfilStore>({
    firstname: "",
    lastname: "",
    newPassword1: "",
    newPassword2: "",
    date: new Date(),
    events: [],
  });

  const localizeUrl$ = $((newLocale: SpeakLocale) => {
    let pathname = location.url.pathname;
    if (location.params.lang) {
      if (newLocale.lang !== config.defaultLocale.lang) {
        pathname = pathname.replace(location.params.lang, newLocale.lang);
      } else {
        pathname = pathname.replace(
          new RegExp(`(/${location.params.lang}/)|(/${location.params.lang}$)`),
          "/"
        );
      }
    } else if (newLocale.lang !== config.defaultLocale.lang) {
      pathname = `/${newLocale.lang}${pathname}`;
    }

    navigate(pathname, true);
  });

  useVisibleTask$(async ({ track }) => {
    track(() => user.userEmail);

    const userData = await getUserData(user.userEmail ?? "");

    if (userData.user) {
      store.firstname = userData.user.firstname;
      store.lastname = userData.user.lastname;
      store.language = userData.user.language ?? undefined;
    }

    store.events = await getEvents(user.userEmail ?? "");
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
              value={user.userEmail}
              readOnly
            ></input>
          </div>
          <div class="mt-6">
            <label
              for="language"
              class="mb-2 mt-6 mr-1 text-lg font-medium text-gray-900 dark:text-white"
            >
              {t("profile.language@@Language: ")}
            </label>
            <div class="inline-block w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
              <select
                class="mx-6 my-4 bg-gray-200 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-10/12 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChange$={(event) => {
                  store.language = (
                    event.target as unknown as HTMLInputElement
                  ).value;
                  console.log(store.language);
                }}
              >
                <option selected={store.language === "en-US"} value="en-US">
                  {t("header.english@@English")}
                </option>
                <option selected={store.language === "hu-HU"} value="hu-HU">
                  {t("header.hungarian@@Hungarian")}
                </option>
              </select>
            </div>
          </div>
          <button
            class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
            onClick$={() =>
              save(store, user).then((result) => {
                const speakLocale: SpeakLocale = {
                  lang: store.language ?? "en-US",
                };

                localizeUrl$(speakLocale);

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
                      recieverEmail: user.userEmail ?? "",
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

export function save(store: ProfilStore, user: UserContext) {
  return client.updateUser.mutate({
    params: { email: user.userEmail ?? "" },
    body: {
      firstname: store.firstname,
      lastname: store.lastname,
      language: store.language,
    },
  });
}
