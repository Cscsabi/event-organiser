import { component$, Slot } from "@builder.io/qwik";
import { useNavigate, useLocation } from "@builder.io/qwik-city";
import { generateRoutingLink } from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import { $translate as t, Speak } from "qwik-speak";
import type { ModalProps } from "~/utils/types";

export default component$((props: ModalProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Speak assets={["modal"]}>
      <div
        id={props.id}
        tabIndex={-1}
        aria-hidden={true}
        class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full"
      >
        <div
          class={`relative w-full h-full ${props.size} md:h-auto md:max-h-screen`}
        >
          <div class="relative bg-slate-300 rounded-lg shadow dark:bg-gray-700">
            <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 border-slate-800">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                {props.name}
              </h1>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide={props.id}
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <div class="p-6 space-y-6">
              {props.type === "popup" ? (
                <div class="p-6 text-center">
                  <svg
                    aria-hidden="true"
                    class="mx-auto mb-4 text-black w-14 h-14 dark:text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <button
                    data-modal-hide={props.id}
                    type="button"
                    onClick$={() => {
                      let path = "";
                      switch (props.listType) {
                        case "location": {
                          path = paths.locations;
                          client.deleteLocation.mutate({
                            id: props.listTypeId ?? "",
                          });
                          break;
                        }
                        case "active-event": {
                          path = paths.events;
                          client.deleteEvent.mutate({
                            id: props.listTypeId ?? "",
                          });
                          break;
                        }
                        case "previous-event": {
                          path = paths.previousEvents;
                          client.deleteEvent.mutate({
                            id: props.listTypeId ?? "",
                          });
                          break;
                        }
                        case "contact": {
                          path = paths.contacts;
                          client.deleteContact.mutate({
                            id: props.listTypeId ?? "",
                          });
                          break;
                        }
                        case "guest": {
                          path = paths.guests;
                          client.deleteGuest.mutate({
                            guestId: props.listTypeId ?? "",
                          });
                          break;
                        }
                      }
                      navigate(
                        generateRoutingLink(location.params.lang, path),
                        true
                      );
                    }}
                    class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                  >
                    {t("modal.yes@@Yes, I'm sure")}
                  </button>
                  <button
                    data-modal-hide={props.id}
                    type="button"
                    class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    {t("modal.no@@No, cancel")}
                  </button>
                </div>
              ) : (
                <Slot />
              )}
            </div>
          </div>
        </div>
      </div>
    </Speak>
  );
});
