import { component$ } from "@builder.io/qwik";
import type { CardProps } from "~/utils/types";

export default component$((card: CardProps) => {
  let color: string = "";
  switch (card.type) {
    case "previous": {
      color = "card-prev-light dark:card-prev-dark";
      break;
    }
    case "event": {
      color = "card-ev-light dark:card-ev-dark";
      break;
    }
    case "location": {
      color = "card-loc-light dark:card-loc-dark";
      break;
    }
  }
  return (
    <div class="m-0 inline-block p-8 box-border">
      <a
        class="after:absolute after:top-6 after:left-0 after:content-none after:w-0 after:h-1 after:bg-slate-300 after:transition-all relative text-black dark:text-slate-200"
        href={card.goTo}
      >
        <div class="flex flex-wrap justify-between md:justify-center">
          <div
            class={`bg-loc-light hover:shadow-md hover:scale-105 m-5 p-5 h-64 w-80 grid grid-rows-4 rounded-xl shadow-sm transition-all 
              ${color}
            `}
          >
            <div class="relative text-black dark:text-slate-200">
              {card.icon === "event" ? (
                <i class="fa-regular fa-calendar-days fa-xl fa-beat"></i>
              ) : (
                <i class="fa-solid fa-building fa-xl fa-beat"></i>
              )}
            </div>
            <h2 class="font-bold text-xl">{card.name}</h2>
            <h3 class="pt-2 font-semibold text-lg">{card.description}</h3>
            <h3 class="font-semibold text-lg">{card.location}</h3>
          </div>
        </div>
      </a>
    </div>
  );
});
