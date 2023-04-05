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
import type { Contact } from "@prisma/client";
import { Status } from "event-organiser-api-server/src/status.enum";
import type { UserContext } from "~/utils/types";
import HintCard from "~/components/hint-card/hint.card";

export default component$(() => {
  const user = useContext(CTX);
  const store = useStore<Contact>({
    description: "",
    email: "",
    id: "",
    link: "",
    name: "",
    phone: "",
    userEmail: user.userEmail ?? "",
  });
  const location = useLocation();

  useVisibleTask$(async () => {
    const contact = await getCurrentContact(location.params.contactId);
    if (contact) {
      store.description = contact.description;
      store.email = contact.email;
      store.id = contact.id;
      store.link = contact.link;
      store.name = contact.name;
      store.phone = contact.phone;
    }
  });

  return (
    <Speak assets={["contact", "common", "hint"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("contact.contact@@Contact")}
      </h1>
      <div class="grid gap-4 mb-6 mt-8 md:grid-cols-2 w-full">
        <div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="name"
            >
              {t("common.name@@Name:")}
            </label>
            <input
              minLength={3}
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.name = (event.target as HTMLInputElement).value;
              }}
              value={store.name}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="phone"
            >
              {t("common.phone@@Phone:")}
            </label>
            <input
              type="tel"
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.phone = (event.target as HTMLInputElement).value;
              }}
              value={store.phone}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="email"
            >
              {t("common.email@@Email:")}
            </label>
            <input
              type="email"
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              minLength={6}
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.email = (event.target as HTMLInputElement).value;
              }}
              value={store.email}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="link"
            >
              {t("common.link@@Link:")}
            </label>
            <input
              minLength={3}
              type="url"
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.link = (event.target as HTMLInputElement).value;
              }}
              value={store.link}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="description"
            >
              {t("common.description@@Description:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.description = (event.target as HTMLInputElement).value;
              }}
              value={store.description}
            ></input>
          </div>
          <button
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            preventdefault:click
            onClick$={() => {
              save(store, user);
            }}
          >
            {t("common.save@@Save")}
          </button>
          <button
            data-modal-target="deleteContactModal"
            data-modal-toggle="deleteContactModal"
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            type="button"
          >
            {t("common.delete@@Delete")}
          </button>
        </div>
        <HintCard
          hint1={t("hint.contactHint1@@Be careful when deleting contacts")}
          hint2={t(
            "hint.contactHint2@@If you delete a contact that is used in the budget planning, then those budget planning rows will be deleted as well"
          )}
        />
      </div>
      <Modal
        id="deleteContactModal"
        listType="contact"
        size="max-w-xl"
        type="popup"
        listTypeId={location.params.contactId}
        name={t(
          "contact.deleteContact@@Are you sure you want to delete this contact?"
        )}
      />
      <Toast
        id="successToast6"
        text={t("toast.operationSuccessful@@Operation Successful!")}
        type="success"
        position="top-right"
      ></Toast>
      <Toast
        id="failedToast6"
        text={t("toast.operationFailed@@Operation Failed!")}
        type="failed"
        position="top-right"
      ></Toast>
    </Speak>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const user = useContext(CTX);

  const result = await client.getContacts.query({
    userEmail: user.userEmail ?? "",
  });

  return {
    params: result.contacts?.map((contact) => {
      const id = contact.id;
      return {
        id,
      };
    }),
  };
};

export async function getCurrentContact(contactId: string) {
  const result = await client.getContact.query({ id: contactId });
  if (result.contact) {
    return {
      description: result.contact.description,
      email: result.contact.email,
      id: result.contact.id,
      link: result.contact.link,
      name: result.contact.name,
      phone: result.contact.phone,
      userEmail: result.contact.userEmail,
    } as Contact;
  }
}

export async function save(store: Contact, user: UserContext) {
  const result = await client.updateContact.mutate({
    description: store.description ?? "",
    email: store.email ?? "",
    id: store.id,
    name: store.name,
    phone: store.phone ?? "",
    link: store.link ?? "",
    userEmail: user.userEmail ?? "",
  });

  if (result.status === Status.SUCCESS) {
    const toast = document.getElementById("successToast6");
    if (toast) {
      toast.classList.remove("hidden");
    }
  } else {
    const toast = document.getElementById("failedToast6");
    if (toast) {
      toast.classList.remove("hidden");
    }
  }
}

export const head: DocumentHead = {
  title: "Contact",
};
