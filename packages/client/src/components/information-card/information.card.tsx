import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { generateRoutingLink } from "~/utils/common.functions";
import type { InformationCardProps } from "~/utils/types";

export default component$((props: InformationCardProps) => {
  const location = useLocation();
  return (
    <div class="m-0 p-8 box-border dark:text-white">
      <div
        class={`flex flex-wrap justify-between md:justify-center ${
          props?.textCenter ? "text-center" : "text-justify"
        } overflow-auto`}
      >
        <a href={generateRoutingLink(location.params.lang, props.goTo)}>
          <div class="hover:shadow-md hover:scale-105 m-3 p-5 h-[16.5rem] w-[21rem] grid grid-rows-4 rounded-xl shadow-sm transition-all card-light dark:card-dark">
            <h1 class="font-bold text-center text-xl">{props.name}</h1>
            <h2 class="text-center">
              <i class={props.icon}></i>
            </h2>
            <h2 class="font-semibold text-base">{props.description}</h2>
          </div>
        </a>
      </div>
    </div>
  );
});
