import { component$, useBrowserVisibleTask$, useStore } from "@builder.io/qwik";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { Status } from "event-organiser-api-server/src/status.enum";
import type { NewContact } from "~/utils/types";

export default component$(() => {
  const store = useStore<NewContact>({
    description: "",
    email: "",
    name: "",
    phone: "",
    userEmail: "",
  });
  const navigate = useNavigate();

  useBrowserVisibleTask$(async () => {
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate(paths.login);
    } else {
      store.userEmail = userDetails.data.user.email ?? "";
    }
  });

  return (
    <div>
      <h1 class="mb-6 text-3xl font-semibold text-white dark:text-white">
        Add Contact
      </h1>
      <form
        preventdefault:submit
        onSubmit$={async () => {
          console.log(store.userEmail);
          const result = await client.addContact.mutate({
            description: store.description,
            email: store.email,
            name: store.name,
            phone: store.phone,
            userEmail: store.userEmail,
          });

          if (result.status === Status.SUCCESS) {
            navigate(paths.contacts);
          }
        }}
      >
        <div>
          <label
            class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            for="contactName"
          >
            Contact name:
          </label>
          <input
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onInput$={(event) =>
              (store.name = (event.target as HTMLInputElement).value)
            }
            type="text"
            name="contactName"
            placeholder="Example Ltd."
            required
            minLength={3}
          ></input>
        </div>
        <div>
          <label
            class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            for="phone"
          >
            Phone:
          </label>
          <input
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange$={(event) => {
              store.phone = (event.target as HTMLInputElement).value;
            }}
            type="tel"
            name="phone"
            placeholder="123-456-7890"
          ></input>
        </div>
        <div class="mb-6">
          <label
            class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            for="email"
          >
            Email:
          </label>
          <input
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange$={(event) => {
              store.email = (event.target as HTMLInputElement).value;
            }}
            type="email"
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            minLength={6}
            placeholder="sarah.smith@example.com"
            name="email"
          ></input>
        </div>
        <div class="mb-6">
          <label
            class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            for="description"
          >
            Description:
          </label>
          <input
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange$={(event) => {
              store.description = (event.target as HTMLInputElement).value;
            }}
            type="text"
            name="description"
            placeholder="Something important about this contact..."
          ></input>
        </div>
        <button
          class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
          type="button"
        >
          Add Contact
        </button>
      </form>
    </div>
  );
});
