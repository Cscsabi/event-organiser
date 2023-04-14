import { component$, useContext } from "@builder.io/qwik";
import type { TipCardProps } from "~/utils/types";
import { $translate as t, Speak } from "qwik-speak";
import { CTX } from "~/routes/[...lang]/layout";

export default component$((props: TipCardProps) => {
  const user = useContext(CTX);
  return (
    <Speak assets={["hint"]}>
      <div
        class={`dark:text-white h-full w-full items-center flex justify-center ${
          user.turnOffHints === undefined
            ? "hidden"
            : user.turnOffHints
            ? "hidden"
            : ""
        }`}
      >
        <div class="overflow-auto">
          <div class="block hover:shadow-md m-3 p-5 h-[370px] w-[420px] rounded-xl shadow-sm transition-all card-light dark:card-dark text-justify">
            <h1 class="font-bold text-center text-2xl mt-6 mb-6">
              {t("hint.title@@HINT")}
            </h1>
            <h1 class="text-center mb-6 text-xl">
              <i class="fa-solid fa-circle-exclamation fa-beat fa-xl"></i>
            </h1>
            <h2 class="font-semibold text-lg mb-6">{props.hint1}</h2>
            <h2 class="font-semibold text-lg">{props.hint2}</h2>
          </div>
        </div>
      </div>
    </Speak>
  );
});
