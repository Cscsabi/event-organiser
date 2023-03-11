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
      <h1 class="mb-6 text-3xl font-semibold text-white dark:text-white text-center">
        Add Contact
      </h1>
      <form
        preventdefault:submit
        onSubmit$={async () => {
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
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="contactName"
          >
            Contact name:
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="phone"
          >
            Phone:
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="email"
          >
            Email:
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="description"
          >
            Description:
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onChange$={(event) => {
              store.description = (event.target as HTMLInputElement).value;
            }}
            type="text"
            name="description"
            placeholder="Something important about this contact..."
          ></input>
        </div>
        <button
          class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-1/2 sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
          type="submit"
        >
          Add Contact
        </button>
      </form>
    </div>
  );
});
