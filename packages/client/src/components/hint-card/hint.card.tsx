import { component$ } from "@builder.io/qwik";
import type { TipCardProps } from "~/utils/types";
import { $translate as t, Speak } from "qwik-speak";

export default component$((props: TipCardProps) => {
  return (
    <Speak assets={["hint"]}>
      <div class="dark:text-white h-full w-full items-center flex justify-center">
        <div class="overflow-auto">
          <div class="block hover:shadow-md m-3 p-5 h-80 w-96 rounded-xl shadow-sm transition-all card-home-light dark:card-home-dark">
            <h1 class="font-bold text-center text-xl mt-6 mb-6">
              {t("hint.title@@HINT")}
            </h1>
            <h1 class="text-center mb-6">
              <i class="fa-solid fa-circle-exclamation fa-beat fa-xl"></i>
            </h1>
            <h2 class="font-semibold mb-6">{props.hint1}</h2>
            <h2 class="font-semibold text-base">{props.hint2}</h2>
          </div>
        </div>
      </div>
    </Speak>
  );
});
