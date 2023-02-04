import { component$, useStyles$ } from "@builder.io/qwik";
import styles from "./card.css?inline";
import { Link } from "@builder.io/qwik-city";

export default component$(
  (card: {
    id: string;
    name: string;
    description: string;
    color: string;
    goTo: string;
    icon: string;
  }) => {
    useStyles$(styles);
    return (
      <div class="main-container">
        <Link class="card__link" href={card.goTo}>
          <div class="cards">
            <div class={`card ${card.color}`}>
              <div class="card__icon">
                {card.icon === "event" ? (
                  <i class="fa-regular fa-calendar-days"></i>
                ) : (
                  <i class="fa-solid fa-building"></i>
                )}
              </div>
              <h2 class="card__title">{card.name}</h2>
              <p>{card.description}</p>
              <p class="card__apply"></p>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);
