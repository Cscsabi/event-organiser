import { component$, useStyles$ } from "@builder.io/qwik";
import type { CardInterface } from "~/types";
import Badge from "./badge";
import Button from "./button";
import styles from "./card.css?inline";

export default component$((card: CardInterface) => {
  useStyles$(styles);
  return (
    <article class="card stack-lg">
      {card.indicator && (
        <small class="indicator">{card.indicator}</small>
      )}
      {card.badge && (
        <Badge text={card.badge.text} filled={card.badge.filled} />
      )}
      {card.image && (
        <img src={card.image} alt="Random Image" class="image" />
      )}
      <div class="stack-sm">
        <h3 class="title">{card.title}</h3>
        {card.subtitle && (
          <small class="subtitle">{card.subtitle}</small>
        )}
      </div>
      <p class="body">{card.body}</p>
      <Button
        filled={card.btn.filled}
        type={card.btn.type}
        text={card.btn.text}
        href={card.btn.href}
        icon={card.btn.icon}
      />
    </article>
  );
});
