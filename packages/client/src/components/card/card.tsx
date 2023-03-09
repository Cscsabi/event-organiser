import { component$ } from "@builder.io/qwik";
import type { CardProps } from "~/utils/types";
// import { Link } from "@builder.io/qwik-city";

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
    <div class="m-0 inline-block p-7 box-border">
      <a
        class="after:absolute after:top-6 after:left-0 after:content-none after:w-0 after:h-1 after:bg-slate-300 after:transition-all relative text-black"
        href={card.goTo}
      >
        <div class="flex flex-wrap justify-between md:justify-center">
          <div
            class={`bg-loc-light hover:shadow-md hover:scale-105 m-5 p-5 h-64 w-80 grid grid-rows-4 rounded-xl shadow-sm transition-all 
              ${color}
            `}
          >
            <div class="relative text-black">
              {card.icon === "event" ? (
                <i class="fa-regular fa-calendar-days"></i>
              ) : (
                <i class="fa-solid fa-building"></i>
              )}
            </div>
            <h2 class="grid-rows-4 self-center">{card.name}</h2>
            <p>{card.description}</p>
            <p>{card.location}</p>
            <p class="card__apply"></p>
          </div>
        </div>
      </a>
    </div>
  );
});
