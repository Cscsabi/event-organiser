import type { ButtonInterface } from "~/types";
import styles from "./button.css?inline";
import { component$, useStyles$ } from "@builder.io/qwik";

export default component$((button: ButtonInterface) => {
  useStyles$(styles);
  const filledClass = button.filled ? "filled" : "";
  return (
    <a
      href={button.href}
      class={`btn ${button.type.toLowerCase()} ${filledClass}`}
    >
      <span>{button.text}</span>
      {button.icon}
    </a>
  );
});
