import {
  component$,
  useContext,
  useVisibleTask$,
  useStore,
} from "@builder.io/qwik";
import {
  type StaticGenerateHandler,
  type DocumentHead,
  useLocation,
} from "@builder.io/qwik-city";
import { $translate as t, Speak } from "qwik-speak";
import Modal from "~/components/modal/modal";
import Toast from "~/components/toast/toast";
import { CTX } from "~/routes/[...lang]/layout";
import { client } from "~/utils/trpc";
import type { Guest } from "@prisma/client";
import { Status } from "event-organiser-api-server/src/status.enum";
import type { UserContext } from "~/utils/types";
import HintCard from "~/components/hint-card/hint.card";

export default component$(() => {
  const user = useContext(CTX);
  const store = useStore<Guest>({
    description: "",
    email: "",
    id: "",
    firstname: "",
    lastname: "",
    userEmail: user.userEmail ?? "",
  });
  const location = useLocation();

  useVisibleTask$(async () => {
    const contact = await getCurrentGuest(location.params.guestId);
    if (contact) {
      store.description = contact.description;
      store.email = contact.email;
      store.id = contact.id;
      store.firstname = contact.firstname;
      store.lastname = contact.lastname;
    }
  });

  return (
    <Speak assets={["guestlist", "common", "hint"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("guestlist.guest@@Guest")}
      </h1>
      <div class="grid gap-4 mb-6 mt-8 md:grid-cols-2 w-full">
        <div>
          <div>
            <label
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="firstname"
            >
              {t("common.firstname@@First name:")}
            </label>
            <input
              minLength={3}
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.firstname = (event.target as HTMLInputElement).value;
              }}
              value={store.firstname}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="lastname"
            >
              {t("common.lastname@@Last name:")}
            </label>
            <input
              type="tel"
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.lastname = (event.target as HTMLInputElement).value;
              }}
              value={store.lastname}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="email"
            >
              {t("common.email@@Email:")}
            </label>
            <input
              type="email"
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              minLength={6}
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.email = (event.target as HTMLInputElement).value;
              }}
              value={store.email}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="description"
            >
              {t("common.description@@Description:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.description = (event.target as HTMLInputElement).value;
              }}
              value={store.description}
            ></input>
          </div>
          <button
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            preventdefault:click
            onClick$={async () => {
              save(store, user);
            }}
          >
            {t("common.save@@Save")}
          </button>
          <button
            data-modal-target="deleteGuestModal"
            data-modal-toggle="deleteGuestModal"
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            type="button"
          >
            {t("common.delete@@Delete")}
          </button>
        </div>
        <HintCard
          hint1={t("hint.guestHint1@@Be careful when deleting guests")}
          hint2={t(
            "hint.guestHint2@@If you delete a guest that is assigned to an event, then they get unassigned from that event"
          )}
        />
      </div>
      <Modal
        id="deleteGuestModal"
        listType="guest"
        size="max-w-xl"
        type="popup"
        listTypeId={location.params.guestId}
        name={t(
          "guestlist.deleteGuest@@Are you sure you want to delete this guest?"
        )}
      />
      <Toast
        id="successToast7"
        text={t("toast.operationSuccessful@@Operation Successful!")}
        type="success"
        position="top-right"
      ></Toast>
      <Toast
        id="failedToast7"
        text={t("toast.operationFailed@@Operation Failed!")}
        type="failed"
        position="top-right"
      ></Toast>
    </Speak>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const user = useContext(CTX);

  const result = await client.getGuests.query({
    userEmail: user.userEmail ?? "",
  });

  return {
    params: result.guests?.map((guest) => {
      const id = guest.id;
      return {
        id,
      };
    }),
  };
};

export async function getCurrentGuest(guestId: string) {
  const result = await client.getGuest.query({ guestId: guestId });
  if (result.guest) {
    return {
      description: result.guest.description,
      email: result.guest.email,
      firstname: result.guest.firstname,
      id: result.guest.id,
      lastname: result.guest.lastname,
      userEmail: result.guest.userEmail,
    } as Guest;
  }
}

export async function save(store: Guest, user: UserContext) {
  const result = await client.updateGuest.mutate({
    description: store.description ?? "",
    email: store.email ?? "",
    guestId: store.id,
    firstname: store.firstname ?? "",
    lastname: store.lastname ?? "",
    userEmail: user.userEmail ?? "",
  });

  if (result.status === Status.SUCCESS) {
    const toast = document.getElementById("successToast7");
    if (toast) {
      toast.classList.remove("hidden");
    }
  } else {
    const toast = document.getElementById("failedToast7");
    if (toast) {
      toast.classList.remove("hidden");
    }
  }
}

export const head: DocumentHead = {
  title: "Guest",
};
