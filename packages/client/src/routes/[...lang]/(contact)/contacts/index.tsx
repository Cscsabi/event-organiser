import { component$ } from "@builder.io/qwik";
import { $translate as t, Speak } from "qwik-speak";
import { Contact } from "~/components/contacts/contacts";
import { paths } from "~/utils/paths";

export default component$(() => {
  return (
    <Speak assets={["list", "contact"]}>
      <div class="grid mb-6 md:grid-cols-3 w-full">
        <div class="ml-12 self-start">
          <a
            href={paths.newContact}
            role="button"
            class="block max-w-[15rem] max-h-[7rem] mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
          >
            <div>
              <i class="fa-solid fa-address-book"></i>{" "}
              {t("contact.addContact@@Add Contact")}
            </div>
          </a>
        </div>
        <h1 class="self-center text-center text-3xl font-semibold text-black dark:text-white">
          {t("list.contact@@Contacts")}
        </h1>
      </div>
      <Contact />
    </Speak>
  );
});
